# ESM-only published artifact

Originally planned dual CJS+ESM emission via `tsc` (see ADR-0001). Reversed when we bumped the Node minimum from 20 to 22 — required for stable `with { type: 'json' }` import attributes that let us natively import `src/data.json` in the ESM output without workarounds.

At Node 22.12+, `require(esm)` makes ESM-only libraries fully consumable from CJS, removing the historical interop friction that justified dual emit. We accept that consumers on Node 22.0–22.11 writing CJS need `await import()` instead of `require()` — a vanishing population today.

We gain: a single `tsconfig.build.json` for the build, no per-directory `package.json` markers, one `data.json` in the published `dist/` instead of two, and no semantic mismatch between source and emitted artifacts.
