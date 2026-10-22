import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete"
import type { EditorView } from "@codemirror/view"

import { ICON_NAMES } from "@/lib/icons"

import { COMPONENT_TEMPLATES } from "./templates"

/** Envuelve la selección (o un texto de ejemplo seleccionado) con `before`/`after`. */
export function wrapSelection(view: EditorView, before: string, after: string, sample: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const text = selected || sample
  view.dispatch({
    changes: { from, to, insert: `${before}${text}${after}` },
    selection: { anchor: from + before.length, head: from + before.length + text.length },
    scrollIntoView: true,
  })
  view.focus()
}

/** Agrega un prefijo ("## ", "- ") a cada línea de la selección. */
export function prefixLines(view: EditorView, prefix: string, sample: string) {
  const { from, to } = view.state.selection.main
  const startLine = view.state.doc.lineAt(from)
  const endLine = view.state.doc.lineAt(to)
  const changes = []
  for (let number = startLine.number; number <= endLine.number; number++) {
    const line = view.state.doc.line(number)
    if (line.text.startsWith(prefix)) continue
    changes.push({ from: line.from, insert: prefix })
  }
  if (startLine.number === endLine.number && startLine.text.trim() === "") {
    view.dispatch({
      changes: { from: startLine.from, to: startLine.to, insert: `${prefix}${sample}` },
      selection: {
        anchor: startLine.from + prefix.length,
        head: startLine.from + prefix.length + sample.length,
      },
    })
  } else {
    view.dispatch({ changes })
  }
  view.focus()
}

/**
 * Inserta un bloque en su propia línea, separado por líneas en blanco del
 * texto que lo rodea, y reemplaza el rango [from, to] si se indica.
 */
export function insertBlock(view: EditorView, block: string, range?: { from: number; to: number }) {
  const from = range?.from ?? view.state.selection.main.from
  const to = range?.to ?? view.state.selection.main.to
  const doc = view.state.doc
  const lineBefore = doc.lineAt(from)
  const textBefore = doc.sliceString(lineBefore.from, from)
  const lineAfter = doc.lineAt(to)
  const textAfter = doc.sliceString(to, lineAfter.to)

  let prefix = ""
  if (textBefore.trim()) prefix = "\n\n"
  else if (lineBefore.number > 1 && doc.line(lineBefore.number - 1).text.trim()) prefix = "\n"
  const suffix = textAfter.trim() ? "\n\n" : "\n"

  const insert = `${prefix}${block}${suffix}`
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + prefix.length + block.length },
    scrollIntoView: true,
  })
  view.focus()
}

/** Inserta texto en la línea (por ejemplo un botón o un enlace a un adjunto). */
export function insertInline(view: EditorView, text: string, at?: number) {
  const pos = at ?? view.state.selection.main.head
  view.dispatch({ changes: { from: pos, insert: text }, selection: { anchor: pos + text.length } })
  view.focus()
}

/**
 * Comando "/": escribir "/" al inicio de una línea abre el menú de
 * componentes (autocompletado de CodeMirror).
 */
export function slashCommandSource(context: CompletionContext): CompletionResult | null {
  const line = context.state.doc.lineAt(context.pos)
  const before = line.text.slice(0, context.pos - line.from)
  const match = /^\s*\/([\w-]*)$/.exec(before)
  if (!match) return null

  const from = line.from + before.lastIndexOf("/")
  const options: Completion[] = COMPONENT_TEMPLATES.map((template, index) => ({
    label: `/${template.key}`,
    displayLabel: template.label,
    detail: template.description,
    boost: COMPONENT_TEMPLATES.length - index,
    apply: (view, _completion, applyFrom, applyTo) => {
      if (template.inline) {
        view.dispatch({
          changes: { from: applyFrom, to: applyTo, insert: template.text },
          selection: { anchor: applyFrom + template.text.length },
        })
      } else {
        insertBlock(view, template.text, { from: applyFrom, to: applyTo })
      }
    },
  }))
  return { from, options, validFor: /^\/[\w-]*$/ }
}

/** Autocompletado de nombres de icono al escribir `icon="` (la lista completa está en /guia). */
export function iconCompletionSource(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/icon="[\w-]*/)
  if (!match) return null
  return {
    from: match.from + `icon="`.length,
    options: ICON_NAMES.map((name) => ({ label: name, type: "constant" })),
    validFor: /^[\w-]*$/,
  }
}
