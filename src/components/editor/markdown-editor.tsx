"use client"

import { autocompletion } from "@codemirror/autocomplete"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { languages } from "@codemirror/language-data"
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { EditorView, placeholder } from "@codemirror/view"
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { t } from "@/lib/i18n"

import { iconCompletionSource, slashCommandSource } from "./commands"

type FilesHandler = (files: File[], at: number | null) => void

/** Quién recibe los archivos pegados o soltados en cada editor. */
const fileHandlers = new WeakMap<EditorView, FilesHandler>()

const editorTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "transparent", fontSize: "13.5px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    lineHeight: "1.7",
  },
  ".cm-content": { padding: "20px 0 40vh" },
  ".cm-line": { padding: "0 24px" },
  ".cm-gutters": { display: "none" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
  ".cm-tooltip.cm-tooltip-autocomplete": {
    border: "1px solid var(--border)",
    borderRadius: "10px",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    overflow: "hidden",
  },
  ".cm-tooltip-autocomplete > ul > li": { padding: "6px 10px !important" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "color-mix(in oklch, var(--primary) 18%, transparent)",
    color: "var(--foreground)",
  },
  ".cm-completionDetail": { marginLeft: "10px", fontStyle: "normal", opacity: 0.65 },
})

/** Colores de la app (fondo, texto, selección) con el resaltado de sintaxis de cada tema. */
function appTheme(dark: boolean) {
  return [
    EditorView.theme(
      {
        "&": { color: "var(--foreground)", backgroundColor: "transparent" },
        ".cm-content": { caretColor: "var(--foreground)" },
        ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
        "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
          { backgroundColor: "color-mix(in oklch, var(--primary) 28%, transparent)" },
        ".cm-searchMatch": {
          backgroundColor: "color-mix(in oklch, var(--primary) 20%, transparent)",
        },
        ".cm-panels": { backgroundColor: "var(--card)", color: "var(--foreground)" },
      },
      { dark },
    ),
    syntaxHighlighting(dark ? oneDarkHighlightStyle : defaultHighlightStyle),
  ]
}

const DARK_THEME = appTheme(true)
const LIGHT_THEME = appTheme(false)

const EXTENSIONS = [
  markdown({ base: markdownLanguage, codeLanguages: languages, completeHTMLTags: false }),
  EditorView.lineWrapping,
  // Comando "/" al inicio de una línea y nombres de icono dentro de icon="…".
  autocompletion({ override: [slashCommandSource, iconCompletionSource], icons: false }),
  placeholder(t.editor.placeholder),
  EditorView.contentAttributes.of({ "aria-label": t.editor.tabEdit, spellcheck: "true" }),
  // Pegar o soltar archivos los sube como adjuntos (antes de que CodeMirror los inserte como texto).
  EditorView.domEventHandlers({
    paste(event, view) {
      const files = Array.from(event.clipboardData?.files ?? [])
      const handler = fileHandlers.get(view)
      if (!files.length || !handler) return false
      event.preventDefault()
      handler(files, null)
      return true
    },
    drop(event, view) {
      const files = Array.from(event.dataTransfer?.files ?? [])
      const handler = fileHandlers.get(view)
      if (!files.length || !handler) return false
      event.preventDefault()
      handler(files, view.posAtCoords({ x: event.clientX, y: event.clientY }))
      return true
    },
  }),
  editorTheme,
]

export type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  onReady: (view: EditorView) => void
  /** Archivos pegados o soltados; `at` es la posición donde se soltaron. */
  onFiles: FilesHandler
}

/** Editor de markdown con CodeMirror 6: atajos, comando "/" y adjuntos. */
export function MarkdownEditor({ value, onChange, onReady, onFiles }: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme()
  const [view, setView] = useState<EditorView | null>(null)

  useEffect(() => {
    if (!view) return
    fileHandlers.set(view, onFiles)
    return () => {
      fileHandlers.delete(view)
    }
  }, [view, onFiles])

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      onCreateEditor={(created) => {
        setView(created)
        onReady(created)
      }}
      extensions={EXTENSIONS}
      theme={resolvedTheme === "light" ? LIGHT_THEME : DARK_THEME}
      height="100%"
      className="h-full"
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        autocompletion: false,
        searchKeymap: true,
      }}
    />
  )
}
