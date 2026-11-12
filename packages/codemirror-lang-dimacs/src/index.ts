import {parser} from "./dimacs.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"

/// DIMACS CNF as CaDiCaL reads it (`p cnf` and `p inccnf`). For solver output in the
/// competition format, use `dimacsLanguage.configure({top: "Solution"})`.
export const dimacsLanguage = LRLanguage.define({
  name: "dimacs",
  parser,
  languageData: {
    commentTokens: {line: "c"},
  },
})

/// DIMACS language support for CodeMirror.
export function dimacs() {
  return new LanguageSupport(dimacsLanguage)
}
