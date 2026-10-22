import { expect, test } from "@playwright/test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { GUIDE_ICONS, GUIDE_PROCESS, GUIDE_SECTIONS, GUIDE_TOC, toCodeBlock } from "@/lib/guide"
import { resolveIconName } from "@/lib/icons"
import { DocsMarkdown } from "@/lib/markdown/render"

const render = (source: string) => renderToStaticMarkup(createElement(DocsMarkdown, { source }))

const examples = GUIDE_SECTIONS.flatMap((section) => section.examples)

/** Todo el markdown que la guía renderiza (textos y ejemplos). */
const allMarkdown = [
  GUIDE_PROCESS.source,
  GUIDE_ICONS.intro,
  ...GUIDE_SECTIONS.flatMap((section) => (section.intro ? [section.intro] : [])),
  ...examples.flatMap((example) => [example.description, example.source]),
]

/** HTML sin bloques ni fragmentos de código, donde la sintaxis se muestra a propósito. */
const withoutCode = (html: string) =>
  html.replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "")

test.describe("Guía (/guia)", () => {
  test("todos los componentes de los ejemplos se reconocen (no queda sintaxis como texto)", () => {
    for (const source of allMarkdown) {
      const html = withoutCode(render(source))
      expect(html, source).not.toContain(":::")
      expect(html, source).not.toMatch(/:button\[|::card/)
    }
  })

  test("los IDs de los títulos no se repiten", () => {
    const ids = [
      ...GUIDE_TOC.map((item) => item.id),
      ...allMarkdown.flatMap((source) =>
        Array.from(render(source).matchAll(/<h[1-6][^>]* id="([^"]+)"/g), (match) => match[1]),
      ),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("los enlaces internos (#...) apuntan a secciones que existen", () => {
    const ids = new Set(GUIDE_TOC.map((item) => item.id))
    for (const source of allMarkdown) {
      for (const [, anchor] of render(source).matchAll(/href="#([^"]+)"/g)) {
        expect(ids, `#${anchor}`).toContain(anchor)
      }
    }
  })

  test("los iconos de los ejemplos existen", () => {
    for (const source of allMarkdown) {
      for (const [, name] of source.matchAll(/icon="([^"]*)"/g)) {
        expect(resolveIconName(name), name).not.toBeNull()
      }
    }
  })

  test("el índice tiene una entrada por sección y por ejemplo", () => {
    expect(GUIDE_TOC.map((item) => item.id)).toEqual([
      GUIDE_PROCESS.id,
      ...GUIDE_SECTIONS.flatMap((section) => [
        section.id,
        ...section.examples.map((example) => example.id),
      ]),
      GUIDE_ICONS.id,
    ])
    expect(GUIDE_TOC.map((item) => item.id)).toContain("iconos")
  })
})

test.describe("toCodeBlock", () => {
  test("muestra el markdown tal cual, aunque tenga bloques de código adentro", () => {
    const source = '```js title="a.js"\nconsole.log(1)\n```\n\n:::callout\nTexto\n:::'
    const block = toCodeBlock(source)
    expect(block.startsWith('````md title="Markdown"\n')).toBe(true)
    expect(block.endsWith("\n````")).toBe(true)

    const html = render(block)
    expect(html).toContain("Markdown")
    expect(html).not.toContain("docs-callout")
    expect(html.replace(/<[^>]+>/g, "")).toContain(":::callout")
  })

  test("los ejemplos con pestañas de código se muestran como un solo bloque", () => {
    const codeTabs = examples.find((example) => example.id === "pestanas-de-codigo")
    expect(codeTabs).toBeDefined()
    const html = render(toCodeBlock(codeTabs!.source))
    expect(html.match(/<pre/g)).toHaveLength(1)
    expect(html).not.toContain('role="tablist"')
  })
})
