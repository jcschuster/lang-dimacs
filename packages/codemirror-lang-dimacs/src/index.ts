import {parser} from "./dimacs.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"

/// DIMACS CNF and its dialects: iCNF, QDIMACS, DQDIMACS, WCNF, KNF and XOR clauses. For
/// solver output, use `dimacsLanguage.configure({top: "Solution"})`.
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
