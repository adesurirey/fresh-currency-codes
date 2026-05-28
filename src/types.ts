export interface CurrencyCodeRecord {
  code: string;
  number: string;
  /**
   * Number of minor units the currency subdivides into. `null` when ISO
   * declares the value as `N.A.` (e.g. XAU — no minor unit at all). `null`
   * and `0` are semantically distinct: JPY has zero minor units, XAU has
   * none. See ADR-0003.
   */
  digits: number | null;
  currency: string;
  countries: string[];
  active: boolean;
}

export interface CurrencyCodeOptions {
  includeDeprecated: boolean;
}
