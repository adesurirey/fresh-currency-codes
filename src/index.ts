import data from './data.json' with { type: 'json' };
import type { CurrencyCodeOptions, CurrencyCodeRecord } from './types.js';

const DEFAULT_OPTIONS: CurrencyCodeOptions = {
  includeDeprecated: false,
};

const allCurrencies = data.currencies;
const activeCurrencies = allCurrencies.filter((currency) => currency.active);

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
  const currencies = getCurrencies(options);

  return currencies.find((currency) => currency.code === input.toUpperCase());
};

export const country = (
  input: string,
  options = DEFAULT_OPTIONS,
): CurrencyCodeRecord[] => {
  const currencies = getCurrencies(options);

  return currencies.filter((currency) =>
    currency.countries.includes(input.toLowerCase()),
  );
};

export const number = (
  input: string,
  options = DEFAULT_OPTIONS,
): CurrencyCodeRecord | undefined => {
  const currencies = getCurrencies(options);

  return currencies.find((currency) => currency.number === input);
};

export const codes = (options = DEFAULT_OPTIONS): string[] => {
  const currencies = getCurrencies(options);

  return currencies.map((currency) => currency.code);
};

export const numbers = (options = DEFAULT_OPTIONS): string[] => {
  const currencies = getCurrencies(options);

  return currencies.map((currency) => currency.number);
};

export const countries = (options = DEFAULT_OPTIONS): string[] => {
  const currencies = getCurrencies(options);

  return Array.from(
    new Set(currencies.flatMap((currency) => currency.countries)),
  );
};

export const currencies = getCurrencies;

export const { publishDate } = data;
