# Bun for dev/CI, tsc for build output

We use Bun end-to-end for development and CI — install, run TypeScript scripts, tests, and formatting/lint via Biome — because the lib has a tiny tooling surface and consolidating on a single fast tool eliminates the Yarn + ts-jest + ts-node + tsc matrix. The GitHub Action proposed in `freeall/currency-codes#48` already commits to Bun, so this also keeps the refresh workflow consistent.

Build artifacts are produced by `tsc` rather than `bun build`. Predictable CJS+ESM emission and clean `.d.ts` declarations are non-negotiable for a published library, and `tsc` is the well-understood path to both. We accept the small extra config (two tsconfigs) in exchange for that predictability.
