/**
 * WARNING: Only use snapshots tests here so that it can be updated
 * programmatically by the script that generates the data file.
 */

import { describe, expect, it } from 'bun:test';

import * as cc from '../index.js';

describe('Currency Codes - data', () => {
  it('should return the publish date', () => {
    const result = cc.publishDate;

    expect(result).toMatchInlineSnapshot(`"2025-12-31"`);
  });

  it('count all currencies', () => {
    const result = cc.currencies();

    expect(result.length).toMatchInlineSnapshot(`177`);
  });

  it('count all currencies including deprecated ones', () => {
    const result = cc.currencies({ includeDeprecated: true });

    expect(result.length).toMatchInlineSnapshot(`190`);
  });

  it('count all currency codes', () => {
    const result = cc.codes();

    expect(result.length).toMatchInlineSnapshot(`177`);
  });

  it('count all currency codes including deprecated ones', () => {
    const result = cc.codes({ includeDeprecated: true });

    expect(result.length).toMatchInlineSnapshot(`190`);
  });

  it('count all currency numbers', () => {
    const result = cc.numbers();

    expect(result.length).toMatchInlineSnapshot(`177`);
  });

  it('count all currency numbers including deprecated ones', () => {
    const result = cc.numbers({ includeDeprecated: true });

    expect(result.length).toMatchInlineSnapshot(`190`);
  });

  it('count all unique countries', () => {
    const result = cc.countries();

    expect(result.length).toMatchInlineSnapshot(`261`);
  });

  it('count all unique countries including deprecated currencies', () => {
    const result = cc.countries({ includeDeprecated: true });

    expect(result.length).toMatchInlineSnapshot(`263`);
  });

  it('should mark X-codes with no minor unit as null', () => {
    expect(cc.code('XAU')).toMatchObject({ digits: null });
  });
});
