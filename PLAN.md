# PLAN — lang-dimacs

CodeMirror 6 language package (`codemirror-lang-dimacs`) with a hand-written Lezer grammar for the DIMACS dialects CaDiCaL reads. Written 2026-11-11. Status: nothing started.

## Rules for the agent

- Work through the phases in order. Tick a box only when its check passes.
- `[verify]` = from memory or unchecked. Confirm against the named source first; correct this file if it is wrong.
- `[ask]` = decision for Johannes. Stop and ask; do not pick silently.
- Environment: NixOS, fish, direnv. Use only tools from the flake devshell; no global installs; `pnpm`, not `npm`/`npx`.
- Do not publish to npm, push tags, or open upstream issues/PRs without asking.
- Generated files are committed. Every hand-written part is listed in the package README.
- README and NOTICE claim no conformance beyond what the tests show.

## Conventions shared by the five lang-* repos

- Layout as in lang-tptp: `spec/` (inputs + `SOURCE` with URL, version, sha256, date), `gen/` (Node ESM scripts), `fixtures/`, `packages/codemirror-lang-dimacs/`.
- Exports: `dimacs()` → `LanguageSupport`, `dimacsLanguage` → `LRLanguage`.
- CamelCase node names; shared names where the concept exists: `LineComment`, `Number`.
- Root scripts: `pnpm generate` (no-op here), `pnpm build`, `pnpm test`.

## Scope

In: `p cnf`, `p inccnf` with cubes, comments, embedded options, and the competition solution format (second top rule).
Out: `p sat`, WCNF, QDIMACS, XOR lines, `p knf` — CaDiCaL's parser rejects anything but `c` or `i` after `p `.

## Facts

Read from CaDiCaL `src/parse.cpp` as vendored in rustsat-cadical 0.7.5 (docs.rs, 2026-11-11):

1. Before the problem line, lines starting with `c` are comments. In relaxed and forced mode, spaces, tabs, CR and LF before them are skipped.
2. Embedded options: in a header comment, everything from the first `-` to end of line is passed to `set_long_option`. Body comments are not scanned for options.
3. Problem line: `p cnf <max-var> <num-clauses>` or `p inccnf` (no numbers). Strict mode demands single spaces and an immediate newline; relaxed mode allows runs of spaces and tabs.
4. Body: space, tab, CR, LF are interchangeable separators. A literal is an optional `-` followed directly by digits, and must be followed by whitespace, EOF or `c`. `0` ends a clause. Clauses may span lines; several may share a line.
5. `c` at a token position starts a comment to end of line anywhere in the body. `c` directly after a literal does the same.
6. `p inccnf` only: the first `a` at a token position ends the clause section. Cubes follow: `a`, literals, `0`. After each `0` only whitespace, comments, another `a`, or EOF. Two `a` in a row is an error.
7. `a` in a `p cnf` file is an error.
8. Header counts are enforced unless in forced mode (too many clauses, clause missing, literal exceeds max-var). This is lint material, not grammar.
9. Solution file: `c` lines, then exactly `s SATISFIABLE`, then `v` lines (`v`, space, literals), ended by literal `0`. After the status line every line must start with `v`; a `c` directly after a literal is an error.

Unchecked:

- `[verify]` Which upstream CaDiCaL version rustsat-cadical 0.7.5 vendors, and whether the nixpkgs `cadical` behaves the same (diff its `parse.cpp`).
- `[verify]` Whether the `cadical` CLI accepts `p inccnf` (the parser takes a `parse_inccnf_too` flag).
- `[verify]` Other status lines in solver output (`s UNSATISFIABLE`, `s UNKNOWN`) and exit codes 10/20.
- `[verify]` nixpkgs attribute name `cadical`.

## Phase 0 — Bootstrap

- [ ] Read the template copy under `packages/` (from lang-tptp) and the root files; note its build, test and generate commands.
- [ ] Rename everything: `git grep -il tptp` must end empty apart from deliberate credit lines.
- [ ] Remove TPTP-specific parts: mix-based `gen/`, nightly `tptp.yml`, `tools/differential`.
- [ ] `flake.nix` devshell: `nodejs`, `pnpm`, `cadical`. Commit `flake.lock`.
- [ ] `pnpm install && pnpm build && pnpm test` pass on a stub grammar.

## Phase 1 — Grammar (`src/dimacs.grammar`, hand-written)

- [ ] Top `Dimacs`: header comments, `ProblemLine`, clauses, optional cubes.
- [ ] Top `Solution`: comments, `StatusLine`, `ValueLine`s. Selected with `parser.configure({top: "Solution"})`.
- [ ] Tokens: `LineComment`, `Format` (`cnf` | `inccnf`), `PositiveLiteral`, `NegativeLiteral`, `Terminator` (`0`), `CubeMarker` (`a`), header numbers, `Status`.
- [ ] Resolve the `c` comment versus `cnf` overlap after `p `; add a test for `p cnf 3 2` and for `p\tcnf  3   2`.
- [ ] Handle a comment directly after a literal (`1 -2 0c note`).
- [ ] Literals with leading zeros and `-` without a digit: decide token shapes from fact 4 and test them.
- [ ] Be permissive: accept relaxed whitespace and `a` cubes regardless of header format. Strictness is for a linter.
- [ ] Optional: `OptionComment` token for header comments containing `--name[=value]` (fact 2).

## Phase 2 — CodeMirror package

- [ ] `styleTags`: comments, `p`/`a`/`s`/`v` markers, `Format`, header numbers, positive and negative literals (distinct tags), `Terminator`, `Status`.
- [ ] `languageData`: `commentTokens: {line: "c"}`.
- [ ] Folding: none, unless cubes section proves useful.
- [ ] `[ask]` Lint extension (`@codemirror/lint`) for fact 8, missing final `0`, `a` in `p cnf` — in this package, or left to Loge's backend linter?
- [ ] `[ask]` npm name `codemirror-lang-dimacs` (check `pnpm view codemirror-lang-dimacs`).
- [ ] Package README: scope, facts above with source, list of hand-written files (all of them).

## Phase 3 — Tests

- [ ] `test/*.txt` in Lezer `fileTests` format: one case per fact 1–9, plus error cases.
- [ ] `fixtures/valid/*.cnf`, `*.icnf` `[verify extension]`, `fixtures/solution/*`.
- [ ] Script: every valid fixture is accepted by `cadical` and parses in Lezer without error nodes.
- [ ] Script: every `fixtures/invalid/*` is rejected by `cadical` (no requirement on Lezer).
- [ ] Highlight coverage test: every named node has a tag or is listed as intentionally untagged.

## Phase 4 — CI and release

- [ ] `.github/scripts/test-all.sh` runs build, tests, fixture checks; CI runs it inside `nix develop`.
- [ ] Carry over `version.sh`, `release.yml` (PR labelled `release`, npm trusted publishing) and `CHANGELOG.md` from lang-tptp; adapt names.
- [ ] `NOTICE`: behaviour derived from reading CaDiCaL (MIT); no code copied.

## Done when

- [ ] All boxes above ticked or explicitly waived by Johannes.
- [ ] `nix develop -c .github/scripts/test-all.sh` passes from a clean clone.

## After this plan (Johannes)

Configure npm trusted publishing for the package, first release, add the package to the Loge cell bundle.
