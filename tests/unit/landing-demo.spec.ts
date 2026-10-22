import { expect, test } from "@playwright/test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { isIconName, resolveIconName } from "@/lib/icons"
import { DEMO_LINK_PREFIX, DEMO_PAGES, DEMO_SPACES } from "@/lib/landing-demo"
import { DocsMarkdown } from "@/lib/markdown/render"

const render = (source: string) => renderToStaticMarkup(createElement(DocsMarkdown, { source }))

/** HTML sin bloques ni fragmentos de código, donde la sintaxis se muestra a propósito. */
const withoutCode = (html: string) =>
  html.replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "")

test.describe("Demo de la landing", () => {
  test("cada espacio tiene páginas y cada página un espacio y un padre válidos", () => {
    const ids = new Set(DEMO_PAGES.map((page) => page.id))
    expect(ids.size).toBe(DEMO_PAGES.length)
    for (const space of DEMO_SPACES) {
      expect(isIconName(space.icon), space.icon).toBe(true)
      expect(
        DEMO_PAGES.some((page) => page.spaceId === space.id),
        space.id,
      ).toBe(true)
    }
    for (const page of DEMO_PAGES) {
      expect(
        DEMO_SPACES.some((space) => space.id === page.spaceId),
        page.id,
      ).toBe(true)
      if (page.parentId) {
        const parent = DEMO_PAGES.find((candidate) => candidate.id === page.parentId)
        expect(parent?.spaceId, page.id).toBe(page.spaceId)
      }
    }
  })

  test("todos los componentes se reconocen (no queda sintaxis como texto)", () => {
    for (const page of DEMO_PAGES) {
      const html = withoutCode(render(page.source))
      expect(html, page.id).not.toContain(":::")
      expect(html, page.id).not.toMatch(/:button\[|::card/)
    }
  })

  test("los enlaces de la demo abren páginas que existen", () => {
    const ids = new Set(DEMO_PAGES.map((page) => page.id))
    for (const page of DEMO_PAGES) {
      for (const [, href] of render(page.source).matchAll(/href="([^"]+)"/g)) {
        // Solo enlaces entre páginas de la demo: nada que saque de la landing.
        expect(href.startsWith(DEMO_LINK_PREFIX), `${page.id}: ${href}`).toBe(true)
        expect(ids, `${page.id}: ${href}`).toContain(href.slice(DEMO_LINK_PREFIX.length))
      }
    }
  })

  test("los títulos no repiten IDs entre páginas (todas están en el DOM)", () => {
    const ids = DEMO_PAGES.flatMap((page) =>
      Array.from(render(page.source).matchAll(/<h[1-6][^>]* id="([^"]+)"/g), (match) => match[1]),
    )
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).not.toContain("demo")
    expect(ids).not.toContain("funciones")
  })

  test("los iconos de las tarjetas existen", () => {
    for (const page of DEMO_PAGES) {
      for (const [, name] of page.source.matchAll(/icon="([^"]*)"/g)) {
        expect(resolveIconName(name), `${page.id}: ${name}`).not.toBeNull()
      }
    }
  })
})
