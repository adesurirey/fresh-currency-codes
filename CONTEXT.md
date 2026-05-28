# fresh-currency-codes

A Node library that exposes the current and historical [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) currency list, refreshed automatically from the SIX-Group source.

## Language

**Currency**:
A single entry in the ISO 4217 list — identified by its alphabetic **Code** and numeric **Number**, used in one or more **Countries**.
_Avoid_: "money", "tender".

**Code**:
The 3-letter alphabetic identifier for a **Currency** (e.g. `EUR`, `USD`, `XAU`). Always uppercase.
_Avoid_: "symbol", "ticker".

**Number**:
The 3-digit numeric identifier for a **Currency**, kept as a zero-padded string (e.g. `'008'`, `'978'`). String, not number — to preserve leading zeros.
_Avoid_: "code number", "numeric code".

**Country**:
An ISO-official country name as it appears in the **SIX-Group list**, lowercased verbatim (e.g. `'united states of america (the)'`, `'united kingdom of great britain and northern ireland (the)'`). No aliasing, no normalisation.
_Avoid_: "nation", "territory", colloquial names.

**Digits**:
Number of minor units a **Currency** subdivides into (e.g. `2` for EUR, `0` for JPY). `null` when ISO declares the value as `N.A.` — meaning the **Currency** has no minor unit at all (e.g. XAU). `null` and `0` are semantically distinct.
_Avoid_: "decimals", "precision", "fraction".

**Publish date**:
The date the **SIX-Group list** snapshot was published, as it appears in the XML's `Pblshd` field. The freshness signal for consumers.

**Active**:
A **Currency** present in the **latest** **SIX-Group list**. Has `active: true`.

**Deprecated**:
A **Currency** that was once present in a previous **SIX-Group list** but is absent from the latest one. Persisted in our committed dataset with `active: false`. Filtered out by default; surfaced via `{ includeDeprecated: true }`.
_Avoid_: "inactive", "retired", "obsolete" (in code/docs).

**SIX-Group list**:
The canonical machine-readable ISO 4217 source: [`list-one.xml`](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml) published by SIX Financial Information on behalf of ISO. Our only source of truth.
_Avoid_: "ISO data", "the data" (ambiguous).

**Test code**:
A non-currency code reserved by ISO for testing or "no currency" semantics (e.g. `XTS`, `XXX`). Treated as a regular **Currency** by this library — not filtered, not flagged. Consumers can detect them with `code.startsWith('X')` if they care.

## Relationships

- A **Currency** has exactly one **Code** and exactly one **Number**.
- A **Currency** is used in zero or more **Countries** (some currencies like XAU have none).
- A **Currency** is either **Active** or **Deprecated** at any given **Publish date**.
- A **Currency** can transition from **Deprecated** back to **Active** if it reappears in a later **SIX-Group list** — the `active` flag tracks the latest known state.

## Example dialogue

> **Dev:** "What's the **Digits** for XAU?"
> **Domain expert:** "`null`. XAU has no minor unit at all — it's traded by mass, not in cents. That's different from JPY which has a defined zero minor units."
>
> **Dev:** "If Croatia adopts the Kuna again, does HRK become **Active**?"
> **Domain expert:** "Yes — the moment it reappears in the **SIX-Group list**, the next refresh flips `active` to `true`. We don't track the history of transitions, only the latest state."

## Flagged ambiguities

- "inactive" vs "deprecated": resolved — **Deprecated** is the canonical term. The `active: false` flag is the implementation; **Deprecated** is the concept.
- "country" was almost defined as the canonical English country name (e.g. "United States"). Resolved: we use the verbatim ISO-official lowercased name. No aliasing.
