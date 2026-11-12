import type {NodePropSource} from "@lezer/common"
import {styleTags, tags as t} from "@lezer/highlight"

export const dimacsHighlighting: NodePropSource = styleTags({
  LineComment: t.lineComment,
  "p CubeMarker s v": t.keyword,
  Format: t.typeName,
  Number: t.number,
  PositiveLiteral: t.variableName,
  NegativeLiteral: t.special(t.variableName),
  Terminator: t.separator,
  Status: t.bool,
})
