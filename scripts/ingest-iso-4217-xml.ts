import fs from 'node:fs';
import xml2js from 'xml2js';

import prevData from '../src/data.json';
import type { CurrencyCodeRecord } from '../src/types';
import {
  ISO_4217_CURRENCY_LIST_URL,
  ISO_4217_XML_FILE_PATH,
} from './constants';

type IsoDataXml = {
  ISO_4217: {
    CcyTbl: {
      CcyNtry: {
        Ccy?: { _: string };
        CtryNm?: { _: string };
        CcyNm: { _: string };
        CcyNbr?: { _: string };
        CcyMnrUnts?: { _: string };
      }[];
    };
    Pblshd: string;
  };
};

const input = ISO_4217_XML_FILE_PATH;
const output = 'src/data.json';

/**
 * ISO publishes `N.A.` for currencies with no minor unit at all (e.g. XAU,
 * XDR). That's semantically distinct from `0` (JPY/KRW — defined zero minor
 * units), so we surface it as `null`. See ADR-0003.
 */
function parseDigits(raw?: string): number | null {
  if (raw === undefined) {
    return null;
  }
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function ingestEntry(
  entry: IsoDataXml['ISO_4217']['CcyTbl']['CcyNtry'][number],
): CurrencyCodeRecord | undefined {
  if (!entry.Ccy || !entry.CcyNbr) {
    console.warn('Skipping invalid entry:', entry);
    return undefined;
  }

  return {
    active: true,
    code: entry.Ccy._,
    countries: (entry.CtryNm?._ && [entry.CtryNm._.toLowerCase()]) || [],
    currency: entry.CcyNm._,
    digits: parseDigits(entry.CcyMnrUnts?._),
    number: entry.CcyNbr._,
  };
}

function indexByCode(
  index: Record<string, CurrencyCodeRecord>,
  entry: CurrencyCodeRecord | undefined,
): Record<string, CurrencyCodeRecord> {
  if (!entry) {
    return index;
  }

  if (!index[entry.code]) {
    index[entry.code] = entry;
  } else {
    index[entry.code].countries = index[entry.code].countries.concat(
      entry.countries,
    );
  }
  return index;
}

function ingestEntries(data: IsoDataXml): CurrencyCodeRecord[] {
  const currenciesByCode = data.ISO_4217.CcyTbl.CcyNtry.map(ingestEntry).reduce(
    indexByCode,
    {},
  );

  return Object.values(currenciesByCode).filter((c) => !!c.code);
}

function compareCurrencyCodeRecord(
  a: CurrencyCodeRecord,
  b: CurrencyCodeRecord,
): number {
  return a.code.localeCompare(b.code);
}

function ingestPublishDate(data: IsoDataXml): string {
  return data.ISO_4217.Pblshd;
}

function failOnError(error: unknown) {
  if (!error) {
    return;
  }

  console.error(error);
  process.exit(1);
}

fs.readFile(input, (readFileError, data) => {
  failOnError(readFileError);

  xml2js.parseString(
    data,
    {
      explicitArray: false, // turn off array wrappers around content
      explicitCharkey: true, // put all content under a key so its easier to parse when there are attributes
      mergeAttrs: true, // lift attributes up so they're easier to parse
    },
    (parseError, result: IsoDataXml) => {
      failOnError(parseError);

      const publishDate = ingestPublishDate(result);
      const nextCurrencies = ingestEntries(result);
      const inactiveCurrencies = prevData.currencies.filter(
        (prevCurrency) =>
          !nextCurrencies.some(
            (nextCurrency) => prevCurrency.code === nextCurrency.code,
          ),
      );
      const currencies = nextCurrencies
        .concat(
          inactiveCurrencies.map((currency) => ({
            ...currency,
            active: false,
          })),
        )
        .sort(compareCurrencyCodeRecord);
      const dataContent = {
        currencies,
        publishDate: publishDate,
        source: ISO_4217_CURRENCY_LIST_URL,
      };

      fs.writeFile(
        output,
        JSON.stringify(dataContent, null, '  '),
        (writeError) => {
          failOnError(writeError);

          console.log('\nDone ✅');
          console.log(
            ` - Additions: ${currencies.length - prevData.currencies.length}`,
          );
          console.log(` - Deprecations: ${inactiveCurrencies.length}`);
        },
      );
    },
  );
});
