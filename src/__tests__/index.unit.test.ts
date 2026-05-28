import { beforeAll, describe, expect, it, mock } from 'bun:test';

// Migration notes — bun:test vs jest:
// 1. `mock.module` is NOT hoisted like `jest.mock`. Static `import` statements
//    would run first and evaluate `src/index.ts` with the real `data.json`
//    before the mock could register. We register the mock at the top of the
//    module and load the SUT via dynamic `import` in `beforeAll` so the mocked
//    JSON is what `src/index.ts` reads when it evaluates.
// 2. JSON interop: `src/index.ts` uses `import data from './data.json'`, so the
//    mocked module must expose the dataset under `default`.
// 3. `bun test` is invoked with `--isolate` (see `package.json#scripts.test`).
//    Without it, `mock.module` mutates a process-global registry that leaks
//    across files, so the integration test's static `import` of `../index`
//    would race the unit test's mock. `--isolate` (Bun ≥1.3.13) gives each
//    test file a fresh module registry, so the unit-test mock stays scoped.
mock.module('../data.json', () => ({
  default: {
    currencies: [
      {
        active: false,
        code: 'HRK',
        countries: ['croatia'],
        currency: 'Kuna',
        digits: 2,
        number: '191',
      },
      {
        active: true,
        code: 'USD',
        countries: ['american samoa', 'united states of america (the)'],
        currency: 'US Dollar',
        digits: 2,
        number: '840',
      },
      {
        active: true,
        code: 'USN',
        countries: ['united states of america (the)'],
        currency: 'US Dollar (Next day)',
        digits: 2,
        number: '997',
      },
    ],
    publishDate: '2025-04-10',
    source: 'https://www.source.com/download/iso-currency-codes.xml',
  },
}));

let cc!: typeof import('../index.js');

beforeAll(async () => {
  cc = await import('../index.js');
});

describe('Currency Codes - API', () => {
  describe('publishDate', () => {
    it('should return the publish date', () => {
      const result = cc.publishDate;

      expect(result).toEqual('2025-04-10');
    });
  });

  describe('code', () => {
    it('should return an active currency', () => {
      const result = cc.code('USD');

      expect(result).toEqual({
        active: true,
        code: 'USD',
        countries: expect.arrayContaining(['united states of america (the)']),
        currency: 'US Dollar',
        digits: 2,
        number: '840',
      });
    });

    it('should not return an inactive currency', () => {
      const result = cc.code('HRK');

      expect(result).toBeUndefined();
    });

    it('should return an inactive currency', () => {
      const result = cc.code('HRK', { includeDeprecated: true });

      expect(result).toEqual({
        active: false,
        code: 'HRK',
        countries: ['croatia'],
        currency: 'Kuna',
        digits: 2,
        number: '191',
      });
    });
  });

  describe('country', () => {
    it('should return active currencies', () => {
      const result = cc.country('united states of america (the)');

      expect(result).toEqual([
        expect.objectContaining({
          code: 'USD',
        }),
        expect.objectContaining({
          code: 'USN',
        }),
      ]);
    });

    it('should not return inactive currencies', () => {
      const result = cc.country('croatia');

      expect(result).toEqual([]);
    });

    it('should return inactive currencies', () => {
      const result = cc.country('croatia', { includeDeprecated: true });
      expect(result).toEqual([
        expect.objectContaining({
          code: 'HRK',
        }),
      ]);
    });

    it('should be case insensitive', () => {
      const result = cc.country('Croatia', { includeDeprecated: true });
      expect(result).toEqual([
        expect.objectContaining({
          code: 'HRK',
        }),
      ]);
    });
  });

  describe('number', () => {
    it('should return an active currency', () => {
      const result = cc.number('840');

      expect(result).toEqual({
        active: true,
        code: 'USD',
        countries: expect.arrayContaining(['united states of america (the)']),
        currency: 'US Dollar',
        digits: 2,
        number: '840',
      });
    });

    it('should not return an inactive currecny', () => {
      const result = cc.number('191');

      expect(result).toBeUndefined();
    });

    it('should return an inactive currency', () => {
      const result = cc.number('191', { includeDeprecated: true });

      expect(result).toEqual({
        active: false,
        code: 'HRK',
        countries: ['croatia'],
        currency: 'Kuna',
        digits: 2,
        number: '191',
      });
    });
  });

  describe('codes', () => {
    it('should return all currency codes', () => {
      const result = cc.codes();

      expect(result).toEqual(['USD', 'USN']);
    });

    it('should return all currency codes including inactive ones', () => {
      const result = cc.codes({ includeDeprecated: true });

      expect(result).toEqual(['HRK', 'USD', 'USN']);
    });
  });

  describe('numbers', () => {
    it('should return all currency numbers', () => {
      const result = cc.numbers();

      expect(result).toEqual(['840', '997']);
    });

    it('should return all currency numbers including inactive ones', () => {
      const result = cc.numbers({ includeDeprecated: true });

      expect(result).toEqual(['191', '840', '997']);
    });
  });

  describe('countries', () => {
    it('should return all unique countries', () => {
      const result = cc.countries();

      expect(result).toEqual([
        'american samoa',
        'united states of america (the)',
      ]);
    });

    it('should return all unique countries including inactive ones', () => {
      const result = cc.countries({ includeDeprecated: true });

      expect(result).toEqual([
        'croatia',
        'american samoa',
        'united states of america (the)',
      ]);
    });
  });

  describe('currencies', () => {
    it('should return all currencies', () => {
      const result = cc.currencies();

      expect(result).toEqual([
        {
          active: true,
          code: 'USD',
          countries: expect.arrayContaining(['united states of america (the)']),
          currency: 'US Dollar',
          digits: 2,
          number: '840',
        },
        {
          active: true,
          code: 'USN',
          countries: expect.arrayContaining(['united states of america (the)']),
          currency: 'US Dollar (Next day)',
          digits: 2,
          number: '997',
        },
      ]);
    });

    it('should return all currencies including inactive ones', () => {
      const result = cc.currencies({ includeDeprecated: true });

      expect(result).toEqual([
        {
          active: false,
          code: 'HRK',
          countries: ['croatia'],
          currency: 'Kuna',
          digits: 2,
          number: '191',
        },
        {
          active: true,
          code: 'USD',
          countries: expect.arrayContaining(['united states of america (the)']),
          currency: 'US Dollar',
          digits: 2,
          number: '840',
        },
        {
          active: true,
          code: 'USN',
          countries: expect.arrayContaining(['united states of america (the)']),
          currency: 'US Dollar (Next day)',
          digits: 2,
          number: '997',
        },
      ]);
    });
  });
});
