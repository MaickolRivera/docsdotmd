import type { Element, ElementContent, Root } from "hast"
import { toString } from "hast-util-to-string"
import type { HighlighterCore } from "shiki/core"
import { createHighlighterCoreSync } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import css from "shiki/langs/css.mjs"
import diff from "shiki/langs/diff.mjs"
import docker from "shiki/langs/docker.mjs"
import go from "shiki/langs/go.mjs"
import html from "shiki/langs/html.mjs"
import java from "shiki/langs/java.mjs"
import javascript from "shiki/langs/javascript.mjs"
import json from "shiki/langs/json.mjs"
import markdown from "shiki/langs/markdown.mjs"
import python from "shiki/langs/python.mjs"
import rust from "shiki/langs/rust.mjs"
import shellscript from "shiki/langs/shellscript.mjs"
import sql from "shiki/langs/sql.mjs"
import toml from "shiki/langs/toml.mjs"
import tsx from "shiki/langs/tsx.mjs"
import typescript from "shiki/langs/typescript.mjs"
import xml from "shiki/langs/xml.mjs"
import yaml from "shiki/langs/yaml.mjs"
import githubDark from "shiki/themes/github-dark-default.mjs"
import type { Plugin } from "unified"

// Resaltado de código con Shiki en modo síncrono (motor de expresiones
// regulares de JavaScript, sin WASM). Así el mismo renderizador funciona en el
// servidor (lector) y en el navegador (vista previa del editor).

const THEME = "github-dark-default"
/** Bloques más grandes se muestran sin resaltar para no bloquear el render. */
const MAX_HIGHLIGHT_LENGTH = 20_000

/** Alias extra además de los que trae cada gramática (js, ts, py, sh...). */
const ALIASES: Record<string, string> = {
  jsx: "tsx",
  curl: "shellscript",
  console: "shellscript",
  terminal: "shellscript",
  ps1: "shellscript",
  powershell: "shellscript",
  dockerfile: "docker",
  jsonc: "json",
  json5: "json",
  vue: "html",
  svelte: "html",
}

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  python: "Python",
  py: "Python",
  shellscript: "Terminal",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  curl: "cURL",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  go: "Go",
  java: "Java",
  rust: "Rust",
  rs: "Rust",
  diff: "Diff",
  docker: "Dockerfile",
  dockerfile: "Dockerfile",
  toml: "TOML",
  xml: "XML",
  markdown: "Markdown",
  md: "Markdown",
  text: "Texto",
  txt: "Texto",
}

export function languageLabel(lang: string | null | undefined): string {
  if (!lang) return "Código"
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang
}

let highlighter: HighlighterCore | undefined

function getHighlighter(): HighlighterCore {
  highlighter ??= createHighlighterCoreSync({
    themes: [githubDark],
    langs: [
      css,
      diff,
      docker,
      go,
      html,
      java,
      javascript,
      json,
      markdown,
      python,
      rust,
      shellscript,
      sql,
      toml,
      tsx,
      typescript,
      xml,
      yaml,
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
  return highlighter
}

function resolveLanguage(lang: string | undefined): string {
  if (!lang) return "text"
  const id = ALIASES[lang] ?? lang
  return getHighlighter().getLoadedLanguages().includes(id) ? id : "text"
}

function languageFromClassName(className: unknown): string | undefined {
  const classes = Array.isArray(className) ? className : []
  const match = classes.find((value) => typeof value === "string" && value.startsWith("language-"))
  return typeof match === "string" ? match.slice("language-".length).toLowerCase() : undefined
}

function isElement(node: unknown, tagName?: string): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Element).type === "element" &&
    (tagName === undefined || (node as Element).tagName === tagName)
  )
}

function highlightPre(pre: Element, inTabs: boolean): Element {
  const code = pre.children.find((child) => isElement(child, "code"))
  if (!code) return pre

  const lang = languageFromClassName(code.properties.className)
  const title =
    typeof code.properties.dataTitle === "string" ? code.properties.dataTitle : undefined
  const source = toString(code).replace(/\n$/, "")

  let highlighted: Element | undefined
  if (source.length <= MAX_HIGHLIGHT_LENGTH) {
    try {
      const root = getHighlighter().codeToHast(source, {
        lang: resolveLanguage(lang),
        theme: THEME,
        // La primera vez que se usa una gramática el motor compila sus
        // expresiones (~0,5 s): con el límite por defecto de Shiki (500 ms) esa
        // primera línea saldría sin resaltar.
        tokenizeTimeLimit: 3000,
        tokenizeMaxLineLength: 2000,
      })
      highlighted = root.children.find((child): child is Element => isElement(child, "pre"))
    } catch {
      highlighted = undefined
    }
  }

  const children: ElementContent[] = highlighted
    ? highlighted.children
    : [
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: source }],
        },
      ]

  return {
    type: "element",
    tagName: "pre",
    properties: {
      className: ["shiki"],
      tabIndex: 0,
      dataLanguage: lang ?? "text",
      dataTitle: title,
      dataInTabs: inTabs ? "true" : undefined,
    },
    children,
  }
}

/** Plugin de rehype que resalta cada `<pre><code>`. Va después de sanear. */
export const rehypeHighlightCode: Plugin<[], Root> = function () {
  return (tree) => {
    const walk = (parent: Root | Element) => {
      const inTabs = isElement(parent, "docs-code-tabs")
      parent.children = parent.children.map((child) => {
        if (!isElement(child)) return child
        if (child.tagName === "pre") return highlightPre(child, inTabs)
        walk(child)
        return child
      }) as typeof parent.children
    }
    walk(tree)
  }
}
