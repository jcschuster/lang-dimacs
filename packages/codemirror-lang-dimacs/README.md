# codemirror-lang-dimacs

DIMACS CNF language support for [CodeMirror 6](https://codemirror.net/): a Lezer parser
for CNF and its SAT-solver dialects, with highlighting. One language covers them all;
the problem line tells them apart.

```js
import {EditorView, basicSetup} from "codemirror"
import {dimacs} from "codemirror-lang-dimacs"

new EditorView({extensions: [basicSetup, dimacs()], parent: document.body})
```

For solver output (`s`, `v`, `o` and `V` lines), configure the second top rule:

```js
import {LanguageSupport} from "@codemirror/language"
import {dimacsLanguage} from "codemirror-lang-dimacs"

new LanguageSupport(dimacsLanguage.configure({top: "Solution"}))
```

## Scope

| Dialect | Problem line | Body | Source |
|---|---|---|---|
| CNF | `p cnf <vars> <clauses>` | clauses | CaDiCaL 3.0.1, below |
| iCNF | `p inccnf` | clauses, then cubes `a <literals> 0` | CaDiCaL 3.0.1, below |
| [QDIMACS] 1.1 | `p cnf <vars> <clauses>` | quantifier sets `a`/`e <vars> 0`, then clauses | qbflib.org |
| DQDIMACS | `p cnf <vars> <clauses>` | as QDIMACS, plus `d <var> <universals> 0` | [iDQ], [Pedant] |
| XOR clauses | `p cnf <vars> <clauses>` | clauses and `x <literals> 0` | CryptoMiniSat `dimacsparser.h` |
| [KNF] | `p knf <vars> <clauses>` | clauses and `k <bound> <literals> 0` | Cardinality-CDCL README |
| WCNF, old | `p wcnf <vars> <clauses> <top>` | `<weight> <literals> 0` | [MaxSAT Evaluation 2021] |
| WCNF, 2022 | none | `h <literals> 0` and `<weight> <literals> 0` | [MaxSAT Evaluation 2023] |

Solutions: comments, `o <cost>` lines, one status line, then `v` lines (literals) or
`V <literal>` lines. The status is `SATISFIABLE`, `UNSATISFIABLE`, `UNKNOWN`,
`OPTIMUM FOUND`, or QDIMACS's `s cnf <1|0|-1> <vars> <clauses>`.

Quantifier sets, `d` lines and `x` lines may follow any `p cnf` header, so QDIMACS,
DQDIMACS and XOR clauses mix freely; CNF is the case without them. A file without a
problem line is read as 2022 WCNF, so a CNF file missing its header shows no error.

Not covered: `p sat`, DRAT/LRAT proofs, the DIMACS graph and flow formats, and the
model-counting annotations (`c p weight`, `c p show`, `c ind`), which are read as
comments. A MaxSAT `v` line in the bit-string form (`v 0110`) parses, but as literals.

The parser is permissive: it accepts any white space (space, tab, CR, LF) in the problem
line, comments anywhere, header counts that do not match the body, and none of the
semantic rules of the dialects (QDIMACS alternation and an existential innermost set,
positive weights, `top` above the soft weights). Checking those is left to a linter;
this package has none.

[QDIMACS]: https://www.qbflib.org/qdimacs.html
[iDQ]: https://fmv.jku.at/idq/idq_pos2014.pdf
[Pedant]: https://github.com/fslivovsky/pedant-solver
[KNF]: https://github.com/jreeves3/Cardinality-CDCL
[MaxSAT Evaluation 2021]: https://maxsat-evaluations.github.io/2021/rules.html
[MaxSAT Evaluation 2023]: https://maxsat-evaluations.github.io/2023/rules.html

## What CaDiCaL accepts

Read from `src/parse.cpp` of CaDiCaL 3.0.1 (source and checksum in `spec/SOURCE` of the
repository) and checked against its `cadical` binary with the files in `fixtures/`.

1. Before the problem line, lines starting with `c` are comments, and white space
   (space, tab, CR, LF) before them is skipped. A header comment must end with a newline.
2. In a header comment, the text from the first `-` to the end of the line is passed to
   CaDiCaL as an option; only `--name[=value]` takes effect. Comments after the problem
   line are not read for options.
3. Problem line: `p cnf <max-var> <num-clauses>`, or `p inccnf` without numbers, ended by
   a newline. Between `p` and the format any spaces and tabs; between the format and the
   numbers any white space (C `isspace`), newlines included. (`--strict` demands single spaces.)
4. In the body, space, tab, CR and LF separate tokens. A literal is an optional `-` and
   digits, followed by white space, end of file or `c`. Leading zeros are allowed: `007`
   is `7`, and `0`, `00` and `-0` all end a clause. Clauses may span lines and share
   them.
5. `c` at the start of a token starts a comment to the end of the line, also directly
   after a literal (`1 -2 0c note`).
6. `p inccnf` only: the first `a` at the start of a token ends the clauses. Each cube is
   `a`, literals, `0`; an `a` before that `0` is an error. After a cube's `0` only white
   space, another `a` or the end of the file may follow, and a comment only if it runs to
   the end of the file.
7. `a` in a `p cnf` file is an error. Here it starts a QDIMACS quantifier set, so it is
   one after the clauses.
8. Unless `--force` is given, the clause count must match and no literal may exceed
   `<max-var>`.
9. A solution (`cadical -r`) is: lines starting with `c`, then exactly `s SATISFIABLE`,
   then lines starting with `v ` holding literals, the last ended by `0`. A comment
   directly after a literal is an error there. The `cadical` binary itself prints
   `s SATISFIABLE`, `s UNSATISFIABLE` or `c UNKNOWN`, and exits with 10, 20 or 0.

## Hand-written files

Every source file is hand-written; nothing is generated:

- `src/dimacs.grammar`, `src/dimacs.grammar.d.ts`
- `src/highlight.ts`, `src/index.ts`
- `test/dimacs.txt`, `test/solution.txt`, `test/test.js`, `test/fixtures.js`
- `rollup.config.js`, `tsconfig.json`

The parser in `dist/` is generated from `src/dimacs.grammar` by `@lezer/generator` when
the package is built.
