# SIX-Group XML as the sole data source

The library's "fresh" promise is built on automated ingestion from `https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml` — ISO's de-facto machine-readable channel for ISO 4217. We deliberately reject mixing in human-curated lists (which `freeall/currency-codes` does via a hand-maintained `data.js`) because that breaks reproducibility from the upstream signal and undermines the entire value proposition.

If the SIX URL ever moves or the schema changes, this ADR pins the assumption and forces a deliberate replacement decision rather than a quiet drift to a different source.
