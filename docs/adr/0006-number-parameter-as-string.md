# `number()` accepts a string, not a number

ISO 4217 numeric codes are 3-digit zero-padded values like `'008'` (ALL — Albanian Lek) and `'051'` (AMD — Armenian Dram). We type the `number()` lookup parameter as `string` so the leading zero is preserved at the call site — `cc.number(8)` is a footgun that silently returns `undefined` once the integer loses its padding.

This is strictly stricter than `freeall/currency-codes`, which accepts both string and number. The trade-off is a small ergonomic cost in exchange for a type system that mirrors the underlying data shape and prevents an easy mistake.
