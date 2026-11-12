# codemirror-lang-dimacs

DIMACS CNF language support for [CodeMirror 6](https://codemirror.net/): a Lezer parser
for the dialects that [CaDiCaL](https://github.com/arminbiere/cadical) reads, with
highlighting.

```js
import {EditorView, basicSetup} from "codemirror"
import {dimacs} from "codemirror-lang-dimacs"

new EditorView({extensions: [basicSetup, dimacs()], parent: document.body})
```

For solver output in the SAT competition format (`s` and `v` lines), configure the
second top rule:

```js
import {LanguageSupport} from "@codemirror/language"
import {dimacsLanguage} from "codemirror-lang-dimacs"

new LanguageSupport(dimacsLanguage.configure({top: "Solution"}))
```

## Scope

- `p cnf <max-var> <num-clauses>` and `p inccnf` files, with comments and, after the
  clauses, cubes (`a <literals> 0`).
- Solutions: comments, one status line `s SATISFIABLE`, `s UNSATISFIABLE` or `s UNKNOWN`,
  then `v` lines.

Not covered: `p sat`, WCNF, QDIMACS, XOR lines, `p knf`. CaDiCaL rejects every problem
line but `p cnf` and `p inccnf`.

The parser is permissive: it accepts any white space (space, tab, CR, LF) in the problem
line, cubes after a `p cnf` header, and header counts that do not match the body.
Checking those is left to a linter; this package has none.

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
7. `a` in a `p cnf` file is an error.
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
