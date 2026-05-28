# Country names are the ISO-official label, lowercased verbatim

We expose `'united states of america (the)'` and `'united kingdom of great britain and northern ireland (the)'` rather than colloquial names like `'united states'`. This diverges from `freeall/currency-codes`, which uses friendly names.

Maintaining a curated alias map is a treadmill: any aliasing choice we make becomes its own opinion to defend, and dataset shape can no longer be re-derived from the upstream source. Staying faithful to the SIX-Group label keeps ingestion deterministic and the library's contents reproducible from `list-one.xml` alone. Consumers wanting friendly names can layer their own mapping on top.
