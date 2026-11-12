# lang-dimacs

Editor language support for DIMACS CNF as [CaDiCaL](https://github.com/arminbiere/cadical)
reads it.

| Package | For |
|---|---|
| [`codemirror-lang-dimacs`](packages/codemirror-lang-dimacs) | CodeMirror 6 |

See [CHANGELOG.md](CHANGELOG.md) for releases.

## Working on it

The devshell (`nix develop`, or direnv) has every tool, `cadical` included. Then:

```sh
pnpm install
.github/scripts/test-all.sh    # every check CI runs
```

The grammar is hand-written; `pnpm generate` has nothing to do. `spec/SOURCE` records
the CaDiCaL source the grammar was checked against. `fixtures/` holds inputs that
`cadical` accepts (`valid/`, `solution/`) or rejects (`invalid/`);
`.github/scripts/check-fixtures.sh` checks that it still does.

`.devcontainer/` runs the JavaScript side (Node 26, pnpm) for editors that open dev
containers; it has no `cadical`.

## Releasing

A release is a merged pull request labelled `release`: `release.yml` then stages the
package on npm and creates the GitHub release `vX.Y.Z`, using the version's CHANGELOG
section as release notes. The version goes live once it is approved with 2FA on
npmjs.com (Staged Packages). To prepare one: run `.github/scripts/version.sh X.Y.Z`, add a
`## [X.Y.Z] - date` section to `CHANGELOG.md`, open a pull request and label it
`release`.

npm staging uses trusted publishing: the package trusts `release.yml` of this
repository for `npm stage publish`, so no npm token is stored.

## Licence

MIT; see [LICENSE](LICENSE) and [NOTICE](NOTICE).
