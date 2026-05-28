# fresh-currency-codes

A TypeScript-first lookup library for ISO 4217 currency data, auto-refreshed weekly from the canonical [SIX-Group XML](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml). Active and deprecated currencies, ISO-official country names, and a `publishDate` export so consumers can see exactly how fresh the data is.

> [!NOTE]
> This library is a fork of [`freeall/currency-codes`](https://github.com/freeall/currency-codes). The data shape, sourcing pipeline, and a few API contracts have been tightened; see [Divergences](#divergences-from-currency-codes) below.

## Requirements

- Node.js **22+**
- ESM-only published artifact (no CJS build) — see [ADR-0008](./docs/adr/0008-esm-only-published-artifact.md)

CJS consumers on Node 22.12 or later can `require()` this package directly thanks to `require(esm)`. On Node 22.0–22.11 use `await import('fresh-currency-codes')`.

## Installation

```sh
npm install fresh-currency-codes
```

```sh
yarn add fresh-currency-codes
```

```sh
pnpm add fresh-currency-codes
```

```sh
bun add fresh-currency-codes
```

## Import

```ts
import * as cc from 'fresh-currency-codes'
```

Or named:

```ts
import { code, country, number, publishDate } from 'fresh-currency-codes'
```

## Basic usage

### Look up by code

```ts
cc.code('EUR')
// {
//   active: true,
//   code: 'EUR',
//   countries: [
//     'åland islands',
//     'andorra',
//     'austria',
//     'belgium',
//     'bulgaria',
//     'croatia',
//     'cyprus',
//     'estonia',
//     'european union',
//     'finland',
//     'france',
//     'french guiana',
//     'french southern territories (the)',
//     'germany',
//     'greece',
//     'guadeloupe',
//     'holy see (the)',
//     'ireland',
//     'italy',
//     'latvia',
//     'lithuania',
//     'luxembourg',
//     'malta',
//     'martinique',
//     'mayotte',
//     'monaco',
//     'montenegro',
//     'netherlands (the)',
//     'portugal',
//     'réunion',
//     'saint barthélemy',
//     'saint martin (french part)',
//     'saint pierre and miquelon',
//     'san marino',
//     'slovakia',
//     'slovenia',
//     'spain',
//   ],
//   currency: 'Euro',
//   digits: 2,
//   number: '978',
// }
```

### Look up by ISO numeric code

`number()` takes a **string** — ISO numeric codes are zero-padded 3-digit values and the leading zero matters (see [ADR-0006](./docs/adr/0006-number-parameter-as-string.md)).

```ts
cc.number('978')
// {
//   active: true,
//   code: 'EUR',
//   countries: [ /* same list as above */ ],
//   currency: 'Euro',
//   digits: 2,
//   number: '978',
// }
```

### Look up by country

Country names are the ISO-official label, lowercased verbatim (see [ADR-0004](./docs/adr/0004-iso-official-country-names.md)) — not friendly aliases.

```ts
cc.country('colombia')
// [
//   {
//     active: true,
//     code: 'COP',
//     countries: ['colombia'],
//     currency: 'Colombian Peso',
//     digits: 2,
//     number: '170',
//   },
//   {
//     active: true,
//     code: 'COU',
//     countries: ['colombia'],
//     currency: 'Unidad de Valor Real',
//     digits: 2,
//     number: '970',
//   },
// ]
```

### List all codes / numbers / countries

```ts
cc.codes()
// => ['AED', 'AFN', 'ALL', ...]

cc.numbers()
// => ['784', '971', '008', ...]

cc.countries()
// => ['united arab emirates (the)', 'afghanistan', 'albania', ...]
```

### List all currency records

```ts
cc.currencies()
// [
//   {
//     active: true,
//     code: 'AED',
//     countries: ['united arab emirates (the)'],
//     currency: 'UAE Dirham',
//     digits: 2,
//     number: '784',
//   },
//   {
//     active: true,
//     code: 'AFN',
//     countries: ['afghanistan'],
//     currency: 'Afghani',
//     digits: 2,
//     number: '971',
//   },
//   // ...
// ]
```

### Inspect when the data was last refreshed

```ts
console.log(cc.publishDate)
// => '2026-01-01'
```

## Including deprecated currencies

Deprecated currencies are filtered out by default. Opt in with `{ includeDeprecated: true }` on any of the lookup methods.

```ts
cc.code('ZWL')
// => undefined

cc.code('ZWL', { includeDeprecated: true })
// {
//   active: false,
//   code: 'ZWL',
//   countries: ['zimbabwe'],
//   currency: 'Zimbabwe Dollar',
//   digits: 2,
//   number: '932',
// }
```

The same option works on `number()`, `country()`, `codes()`, `numbers()`, `countries()`, and `currencies()`.

## `digits: null` semantics

ISO publishes `N.A.` for currencies that have **no minor unit at all** (gold, IMF SDRs, the bond-market funds units). We surface this as `digits: null` — semantically distinct from `digits: 0`, which means a defined zero minor units (e.g. JPY). See [ADR-0003](./docs/adr/0003-digits-nullable-for-no-minor-unit.md).

```ts
cc.code('XAU')
// {
//   active: true,
//   code: 'XAU',
//   countries: ['zz08_gold'],
//   currency: 'Gold',
//   digits: null,
//   number: '959',
// }
```

Consumers must handle the `null` case explicitly — flattening it to `0` silently corrupts records like XAU.

## Freshness

The point of this fork is that the dataset stays current without anyone remembering to bump it.

- **Weekly auto-refresh** via GitHub Actions, sourced exclusively from the SIX-Group XML ([`list-one.xml`](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml)).
- **Sanity-guarded** on every refresh: at least 100 active currencies, no more than 10 removals in a single run, and `publishDate` must not regress. A guard failure aborts the refresh and leaves the previous dataset intact.
- **Auto-published on merge** — when a refresh PR (or any version-bumping PR) merges into `main`, the publish workflow ships the new version to npm. See [ADR-0007](./docs/adr/0007-auto-publish-on-version-bump-merge.md).

The `publishDate` export is the canonical freshness signal — it mirrors the `Pblshd` field of the SIX-Group XML, not the npm publish date.

## Divergences from `currency-codes`

| Behaviour | `freeall/currency-codes` | `fresh-currency-codes` |
| --- | --- | --- |
| `number()` parameter | `string` or `number` | **`string` only** (preserves leading zeros — see [ADR-0006](./docs/adr/0006-number-parameter-as-string.md)) |
| `number` field on records | `number` | **`string`** (e.g. `'008'` for ALL) |
| Country names | curated friendly aliases | **ISO-official label, lowercased verbatim** (e.g. `'united kingdom of great britain and northern ireland (the)'` — see [ADR-0004](./docs/adr/0004-iso-official-country-names.md)) |
| `digits` for `N.A.` entries | `number` (often coerced to `0`) | **`number \| null`**, with `null` for entries that have no minor unit at all (see [ADR-0003](./docs/adr/0003-digits-nullable-for-no-minor-unit.md)) |
| Deprecated currencies | filtered out, no opt-in | **opt-in via `{ includeDeprecated: true }`** |
| Freshness signal | none | **`publishDate` export** mirroring the SIX-Group XML |
| Data sourcing | hand-curated | **auto-refreshed weekly** from the SIX-Group XML — no hand-curated entries |

## Updating the data manually

The dataset refreshes automatically every week, so this is rarely needed. To pull a snapshot locally:

```sh
bun run iso
```

This fetches the latest `list-one.xml` from SIX-Group and rewrites `src/data.json`.

## Project structure

- [`CONTEXT.md`](./CONTEXT.md) — domain glossary (Currency, Code, Number, Country, Digits, Publish date, Active, Deprecated, SIX-Group list).
- [`docs/adr/`](./docs/adr/) — architectural decision records (ADRs 0001–0009).

## License

MIT © Arnaud de Surirey — see [`LICENSE`](./LICENSE).
