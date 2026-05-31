import data from './data.json' with { type: 'json' };
import type { CurrencyCodeOptions, CurrencyCodeRecord } from './types.js';

const DEFAULT_OPTIONS: CurrencyCodeOptions = {
  includeDeprecated: false,
};

const allCurrencies = data.currencies;
const activeCurrencies = allCurrencies.filter((currency) => currency.active);

// Point-lookup indexes — O(1) by code
const activeByCode = new Map<string, CurrencyCodeRecord>();
const allByCode = new Map<string, CurrencyCodeRecord>();

// Point-lookup indexes — O(1) by number
const activeByNumber = new Map<string, CurrencyCodeRecord>();
const allByNumber = new Map<string, CurrencyCodeRecord>();

// Multi-result indexes — O(1) by country name
const activeByCountry = new Map<string, CurrencyCodeRecord[]>();
const allByCountry = new Map<string, CurrencyCodeRecord[]>();

for (const currency of allCurrencies) {
  allByCode.set(currency.code, currency);
  allByNumber.set(currency.number, currency);
  for (const c of currency.countries) {
    const bucket = allByCountry.get(c);
    if (bucket) {
      bucket.push(currency);
    } else {
      allByCountry.set(c, [currency]);
    }
  }
  if (currency.active) {
    activeByCode.set(currency.code, currency);
    activeByNumber.set(currency.number, currency);
    for (const c of currency.countries) {
      const bucket = activeByCountry.get(c);
      if (bucket) {
        bucket.push(currency);
      } else {
        activeByCountry.set(c, [currency]);
      }
    }
  }
}

// Pre-computed list results — zero allocation per call
const activeCodes = activeCurrencies.map((currency) => currency.code);
const allCodes = allCurrencies.map((currency) => currency.code);
const activeNumbers = activeCurrencies.map((currency) => currency.number);
const allNumbers = allCurrencies.map((currency) => currency.number);
const activeCountriesList = Array.from(
  new Set(activeCurrencies.flatMap((currency) => currency.countries)),
);
const allCountriesList = Array.from(
  new Set(allCurrencies.flatMap((currency) => currency.countries)),
);

const getCurrencies = ({
  includeDeprecated,
} = DEFAULT_OPTIONS): CurrencyCodeRecord[] => {
  if (includeDeprecated) {
    return allCurrencies;
  }
  return activeCurrencies;
};

export const code = (
  input: string,
  options = DEFAULT_OPTIONS,
): CurrencyCodeRecord | undefined => {
  const map = options.includeDeprecated ? allByCode : activeByCode;
  return map.get(input.toUpperCase());
};

export const country = (
  input: string,
  options = DEFAULT_OPTIONS,
): CurrencyCodeRecord[] => {
  const map = options.includeDeprecated ? allByCountry : activeByCountry;
  return [...(map.get(input.toLowerCase()) ?? [])];
};

export const number = (
  input: string,
  options = DEFAULT_OPTIONS,
): CurrencyCodeRecord | undefined => {
  const map = options.includeDeprecated ? allByNumber : activeByNumber;
  return map.get(input);
};

export const codes = (options = DEFAULT_OPTIONS): string[] => {
  return [...(options.includeDeprecated ? allCodes : activeCodes)];
};

export const numbers = (options = DEFAULT_OPTIONS): string[] => {
  return [...(options.includeDeprecated ? allNumbers : activeNumbers)];
};

export const countries = (options = DEFAULT_OPTIONS): string[] => {
  return [
    ...(options.includeDeprecated ? allCountriesList : activeCountriesList),
  ];
};

export const currencies = getCurrencies;

export const { publishDate } = data;
