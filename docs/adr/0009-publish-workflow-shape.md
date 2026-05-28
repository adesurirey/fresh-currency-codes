# Publish workflow: `v`-prefixed tags, publish-first idempotent steps

GitHub release tags carry a `v` prefix (`v0.1.0`, not `0.1.0`). This matches the overwhelming convention for npm packages on GitHub and aligns with the defaults of tooling we might adopt later (changesets, semantic-release). Once consumers pin to a tag the convention is hard to reverse, so we pin it deliberately upfront.

Inside the version-bump-triggered job, `npm publish --access public --provenance` runs before `gh release create`. The failure-mode asymmetry favours publish-first: a missing release is recoverable annoyance, a missing npm package behind a real release breaks `npm install` and corrodes trust. Provenance attestation lives on the npm side, which is the canonical artifact — the release is descriptive metadata around it.

Both operative steps are individually idempotent so a partial failure heals on workflow rerun without manual cleanup: publish is gated by `npm view fresh-currency-codes version` vs `package.json`, and release creation is gated by `gh release view "$TAG"`. Re-running the whole workflow on the same commit is always safe. The outer version-compare guard keeps the workflow a no-op for non-version-bump pushes (refresh-PR merges that don't bump, Batch E metadata commits, etc.).
