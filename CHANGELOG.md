# Changelog

All notable changes to `codemirror-lang-dimacs` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[semantic versioning](https://semver.org/spec/v2.0.0.html) over what the package
exposes: node names and the exported JavaScript API.

## [Unreleased]

## [0.2.0] - 2026-11-16

### Added

- QDIMACS and DQDIMACS: `QuantifierSet` (`a`/`e` lines) and `DependencySet` (`d` lines)
  between a `p cnf` header and the clauses.
- XOR clauses (`XorClause`, `x` lines) after `p cnf`.
- KNF: `p knf` with `CardinalityConstraint` (`k <Bound> ... 0`) next to clauses.
- WCNF: `p wcnf <vars> <clauses> <top>` and the headerless 2022 format, with
  `WeightedClause` (`Weight`) and `HardClause` (`h`).
- Solutions: `CostLine` (`o`), `s OPTIMUM FOUND`, QDIMACS `s cnf <answer> ...` and `V`
  lines.

### Changed

- A cube (`a`) after the clauses of a `p cnf` file is now a parse error; before the
  clauses `a` starts a quantifier set.
- A file without a problem line parses as WCNF instead of failing.

## [0.1.1] - 2026-11-12

### Changed

- No changes to what the package contains. Releases are now staged on npm with
  `npm stage publish` and go live once a maintainer approves them with 2FA; this is the
  first release made that way.

## [0.1.0] - 2026-11-12

### Added

- `codemirror-lang-dimacs`: a CodeMirror 6 language (Lezer parser) for `p cnf` and
  `p inccnf` files and for solutions in the competition output format, with
  highlighting.
