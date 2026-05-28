# `digits` is `number | null`, where `null` means "no minor unit"

ISO publishes `N.A.` for codes like XAU (gold) — meaning the currency has no minor unit at all, which is semantically distinct from JPY which has zero minor units. We type `digits` as `number | null` and emit `null` for `N.A.` entries so the distinction survives at the type level and consumers must handle the `null` case explicitly.

This diverges from both `freeall/currency-codes` (`number`) and the original draft (`number`, with `N.A.` coerced to `0`). The divergence is intentional and load-bearing — flattening `null` to `0` silently corrupts the meaning of records like XAU.
