import type { PageStatus } from "@/lib/constants"

export type PageListItem = {
  id: string
  parent_id: string | null
  title: string
  slug: string
  status: PageStatus
  position: number
}

export type PageNode = PageListItem & {
  /** Slugs desde la raíz hasta esta página. */
  path: string[]
  depth: number
  children: PageNode[]
}

/**
 * Arma el árbol de páginas. Si el padre de una página no es visible para el
 * usuario (por ejemplo, un borrador), la página queda en la raíz.
 */
export function buildPageTree(pages: readonly PageListItem[]): PageNode[] {
  const nodes = new Map<string, PageNode>()
  for (const page of pages) nodes.set(page.id, { ...page, path: [], depth: 0, children: [] })

  const roots: PageNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const assign = (list: PageNode[], prefix: string[], depth: number) => {
    list.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title, "es"))
    for (const node of list) {
      node.path = [...prefix, node.slug]
      node.depth = depth
      assign(node.children, node.path, depth + 1)
    }
  }
  assign(roots, [], 0)
  return roots
}

/** Recorre el árbol en el orden en que se lee (padre, luego hijas). */
export function flattenTree(nodes: readonly PageNode[]): PageNode[] {
  const out: PageNode[] = []
  const walk = (list: readonly PageNode[]) => {
    for (const node of list) {
      out.push(node)
      walk(node.children)
    }
  }
  walk(nodes)
  return out
}

export function pageHref(orgSlug: string, spaceSlug: string, node: Pick<PageNode, "path">): string {
  return `/${orgSlug}/${spaceSlug}/${node.path.join("/")}`
}

export function editorHref(orgSlug: string, spaceSlug: string, pageId: string): string {
  return `/${orgSlug}/${spaceSlug}/editar/${pageId}`
}

export function getPrevNext(flat: readonly PageNode[], pageId: string) {
  const index = flat.findIndex((node) => node.id === pageId)
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  }
}

/** IDs de todas las subpáginas (hijas, nietas…) de una página. */
export function descendantIds(pages: readonly PageListItem[], pageId: string): string[] {
  const childrenOf = new Map<string, string[]>()
  for (const page of pages) {
    if (!page.parent_id) continue
    const list = childrenOf.get(page.parent_id) ?? []
    list.push(page.id)
    childrenOf.set(page.parent_id, list)
  }
  const out: string[] = []
  const stack = [...(childrenOf.get(pageId) ?? [])]
  while (stack.length) {
    const id = stack.pop()!
    out.push(id)
    stack.push(...(childrenOf.get(id) ?? []))
  }
  return out
}
