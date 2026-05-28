# Releases auto-publish on version bumps merged to `main`

The library's freshness promise leaks if refreshed data lands in `main` but takes weeks to reach npm. A dedicated `publish.yml` workflow watches `main`, compares `package.json` version to the latest published version on npm, and runs `npm publish` whenever the local version is higher — gated on green CI (lint, typecheck, test).

The weekly refresh workflow includes a `npm version patch` step so refresh PRs carry the bump alongside the data change. Manual API-changing PRs bump the version manually. Branch protection on `main` (PR-only, required status checks) is a prerequisite for this design and must be enabled when the public repo is created.

Manual publishing was rejected because it makes the maintainer the bottleneck on the value prop. Tag-based publishing was rejected because the extra `git tag` step adds friction without meaningful safety over CI gating.
