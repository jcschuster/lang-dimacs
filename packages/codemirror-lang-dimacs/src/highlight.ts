import type {NodePropSource} from "@lezer/common"
import {styleTags, tags as t} from "@lezer/highlight"

export const dimacsHighlighting: NodePropSource = styleTags({
  LineComment: t.lineComment,
  "p CubeMarker a e d x k h s o v V": t.keyword,
  Format: t.typeName,
  "Number Weight Bound": t.number,
  PositiveLiteral: t.variableName,
  NegativeLiteral: t.special(t.variableName),
  Terminator: t.separator,
  Status: t.bool,
})
