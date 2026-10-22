import type { Element, Root } from "hast"
import { toString } from "hast-util-to-string"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import { normalizeDirectiveFences } from "./normalize"
import { rehypeSafePlugins, remarkPlugins } from "./pipeline"

export type TocItem = { id: string; text: string; depth: 2 | 3 }

const processor = unified()
  .use(remarkParse)
  .use(remarkPlugins)
  .use(remarkRehype)
  .use(rehypeSafePlugins)
  .freeze()

/**
 * Títulos h2/h3 para "En esta página". Usa el mismo pipeline que el
 * renderizador, así que los IDs coinciden con los de rehype-slug. Los títulos
 * dentro de acordeones se omiten porque están ocultos hasta abrirlos.
 */
export function getToc(markdown: string): TocItem[] {
  const tree = processor.runSync(processor.parse(normalizeDirectiveFences(markdown))) as Root
  const items: TocItem[] = []

  const walk = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue
      if (child.tagName === "docs-accordion") continue
      if (
        (child.tagName === "h2" || child.tagName === "h3") &&
        typeof child.properties.id === "string"
      ) {
        const text = toString(child).trim()
        if (text)
          items.push({ id: child.properties.id, text, depth: child.tagName === "h2" ? 2 : 3 })
        continue
      }
      walk(child)
    }
  }
  walk(tree)
  return items
}
