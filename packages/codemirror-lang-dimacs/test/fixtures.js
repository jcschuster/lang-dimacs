import {dimacsLanguage} from "../dist/index.js"
import {getStyleTags, highlightTree, tagHighlighter, tags as t} from "@lezer/highlight"
import assert from "assert"
import * as fs from "fs"
import * as path from "path"
import {fileURLToPath} from "url"

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures")
const solutionParser = dimacsLanguage.configure({top: "Solution"}).parser

function parserFor(file) {
  return file.endsWith(".sol") ? solutionParser : dimacsLanguage.parser
}

describe("fixtures", () => {
  for (const dir of ["valid", "solution"]) {
    for (const file of fs.readdirSync(path.join(fixtures, dir)).sort()) {
      it(`${dir}/${file} parses without error nodes`, () => {
        const text = fs.readFileSync(path.join(fixtures, dir, file), "utf8")
        const errors = []
        parserFor(file).parse(text).iterate({
          enter: node => { if (node.type.isError) errors.push(JSON.stringify(text.slice(node.from, node.from + 30))) },
        })
        assert.deepStrictEqual(errors, [])
      })
    }
  }
})

describe("highlighting", () => {
  // One class per tag the highlight table uses, so modified tags stay distinct.
  const highlighter = tagHighlighter([
    {tag: t.lineComment, class: "comment"},
    {tag: t.keyword, class: "keyword"},
    {tag: t.typeName, class: "format"},
    {tag: t.number, class: "number"},
    {tag: t.variableName, class: "positive"},
    {tag: t.special(t.variableName), class: "negative"},
    {tag: t.separator, class: "terminator"},
    {tag: t.bool, class: "status"},
  ])

  // Map each highlighted piece of text to its class.
  function classes(parser, text) {
    const result = {}
    highlightTree(parser.parse(text), highlighter, (from, to, cls) => {
      result[text.slice(from, to)] = cls
    })
    return result
  }

  it("separates markers, format, header numbers, literals and terminators", () => {
    assert.deepStrictEqual(classes(dimacsLanguage.parser, "c note\np inccnf\n12 -34 0\na 5 0"), {
      "c note": "comment", p: "keyword", inccnf: "format", 12: "positive", "-34": "negative",
      0: "terminator", a: "keyword", 5: "positive",
    })
    assert.deepStrictEqual(classes(dimacsLanguage.parser, "p cnf 3 2\n"), {p: "keyword", cnf: "format", 3: "number", 2: "number"})
  })

  it("highlights the status and value lines of a solution", () => {
    assert.deepStrictEqual(classes(solutionParser, "s SATISFIABLE\nv 1 -2 0"), {
      s: "keyword", SATISFIABLE: "status", v: "keyword", 1: "positive", "-2": "negative", 0: "terminator",
    })
  })

  // Structural nodes; their tokens carry the highlighting.
  const untagged = ["Dimacs", "Solution", "ProblemLine", "Clause", "Cube", "StatusLine", "ValueLine"]

  it("tags every named node not listed as untagged", () => {
    const seen = new Map()
    const samples = [
      [dimacsLanguage.parser, "c x\np cnf 1 1\n1 -1 0\na 1 0"],
      [dimacsLanguage.parser, "p inccnf\n"],
      [solutionParser, "s SATISFIABLE\nv 1 0"],
    ]
    for (const [parser, text] of samples) {
      parser.parse(text).iterate({enter: node => { seen.set(node.name, getStyleTags(node) != null) }})
    }
    const named = dimacsLanguage.parser.nodeSet.types.filter(type => type.name && !type.isError).map(type => type.name)
    assert.deepStrictEqual([...seen.keys()].sort(), [...new Set(named)].sort(), "the samples cover every node type")
    for (const [name, tagged] of seen) assert.equal(tagged, !untagged.includes(name), name)
  })
})
