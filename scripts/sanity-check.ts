import { execSync } from 'node:child_process';

import currentData from '../src/data.json' with { type: 'json' };

interface Currency {
  code: string;
  active: boolean;
  number: string;
  digits: number | null;
  currency: string;
  countries: string[];
}

interface DataSnapshot {
  currencies: Currency[];
  publishDate: string;
  source: string;
}

const MIN_ACTIVE_CURRENCIES = 100;
const MAX_DEPRECATIONS_PER_REFRESH = 10;

function readPreviousFromHead(): DataSnapshot {
  const stdout = execSync('git show HEAD:src/data.json', {
    encoding: 'utf8',
  });
  return JSON.parse(stdout) as DataSnapshot;
}

function codeSet(snapshot: DataSnapshot): Set<string> {
  return new Set(snapshot.currencies.map((c) => c.code));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

function check(prev: DataSnapshot, current: DataSnapshot): string[] {
  const failures: string[] = [];

  if (current.publishDate === prev.publishDate) {
    const prevCodes = codeSet(prev);
    const currentCodes = codeSet(current);
    if (!setsEqual(prevCodes, currentCodes)) {
      failures.push(
        `G1: publishDate unchanged (${current.publishDate}) but currency set changed`,
      );
    }
  }

  const activeCount = current.currencies.filter((c) => c.active).length;
  if (activeCount < MIN_ACTIVE_CURRENCIES) {
    failures.push(
      `G2: active currency count too low: ${activeCount} (< ${MIN_ACTIVE_CURRENCIES})`,
    );
  }

  const prevActiveByCode = new Map(
    prev.currencies.map((c) => [c.code, c.active]),
  );
  const flipped = current.currencies.filter(
    (c) => !c.active && prevActiveByCode.get(c.code) === true,
  ).length;
  if (flipped > MAX_DEPRECATIONS_PER_REFRESH) {
    failures.push(
      `G3: too many currencies flipped active→deprecated in one refresh: ${flipped} (> ${MAX_DEPRECATIONS_PER_REFRESH})`,
    );
  }

  if (current.publishDate < prev.publishDate) {
    failures.push(
      `G4: publishDate regressed: ${current.publishDate} < ${prev.publishDate}`,
    );
  }

  return failures;
}

const prev = readPreviousFromHead();
const current = currentData as DataSnapshot;
const failures = check(prev, current);

if (failures.length > 0) {
  console.error('Sanity check failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('Sanity check passed');
