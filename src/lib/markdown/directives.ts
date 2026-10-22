import type {
  BlockContent,
  Code,
  Definition,
  DefinitionContent,
  Heading,
  Image,
  Link,
  Node,
  Paragraph,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast"
import type { ContainerDirective, LeafDirective, TextDirective } from "mdast-util-directive"
import { toString } from "mdast-util-to-string"
import type { Plugin } from "unified"

// Convierte las directivas (remark-directive) en elementos con nombre fijo
// ("docs-steps", "docs-callout"...) que luego se renderizan como componentes
// de React. Las directivas desconocidas se muestran como texto. Además
// resuelve los enlaces `attachment:ID` y el título de los bloques de código.

export const CALLOUT_TYPES = ["info", "tip", "warning", "danger"] as const
export type CalloutType = (typeof CALLOUT_TYPES)[number]

export const BUTTON_VARIANTS = ["primary", "secondary", "outline", "ghost"] as const
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** `attachment:ID` -> ruta que valida el permiso y redirige al enlace firmado. */
export function attachmentUrl(url: string): string | null {
  if (!url.startsWith("attachment:")) return null
  const id = url.slice("attachment:".length)
  return UUID.test(id) ? `/api/adjuntos/${id.toLowerCase()}` : null
}

/** Solo enlaces internos, anclas, http(s), mailto y adjuntos. */
export function safeHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const href = value.trim()
  if (!href) return undefined
  const attachment = attachmentUrl(href)
  if (attachment) return attachment
  if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")) return href
  if (href.startsWith("#")) return href
  if (/^(https?:\/\/|mailto:)/i.test(href)) return href
  return undefined
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

function text(value: unknown, max = 200): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().slice(0, max)
  return trimmed || undefined
}

type Directive = ContainerDirective | LeafDirective | TextDirective
type FlowNode = RootContent

function isDirective(node: Node): node is Directive {
  return (
    node.type === "containerDirective" ||
    node.type === "leafDirective" ||
    node.type === "textDirective"
  )
}

/** Nodo intermedio que mdast-util-to-hast convierte en `<hName>` con sus hijos. */
function element(
  hName: string,
  children: FlowNode[],
  hProperties: Record<string, string | undefined> = {},
): FlowNode {
  const properties: Record<string, string> = {}
  for (const [key, value] of Object.entries(hProperties)) {
    if (value !== undefined) properties[key] = value
  }
  // Tipo desconocido para mdast: to-hast lo convierte en `hName` (manejador por defecto).
  return {
    type: "docsElement",
    data: { hName, hProperties: properties },
    children,
  } as unknown as FlowNode
}

/** Separa la etiqueta `[...]` de un contenedor (`:::callout[Título]`) de su contenido. */
function splitLabel(node: ContainerDirective) {
  const [first, ...rest] = node.children
  if (first?.type === "paragraph" && first.data?.directiveLabel) {
    return { label: toString(first), children: rest }
  }
  return { label: undefined, children: node.children }
}

function rawSource(node: Node, source: string): string {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined) return ""
  return source.slice(start, end)
}

/** Directiva desconocida: se muestra el texto original. */
function asText(node: Directive, source: string): FlowNode[] {
  if (node.type === "textDirective") {
    return [{ type: "text", value: rawSource(node, source) || `:${node.name}` } as FlowNode]
  }
  if (node.type === "leafDirective") {
    return [paragraph(rawSource(node, source) || `::${node.name}`)]
  }
  const openingLine = rawSource(node, source).split("\n")[0] || `:::${node.name}`
  return [paragraph(openingLine), ...(node.children as FlowNode[])]
}

function paragraph(value: string): Paragraph {
  return { type: "paragraph", children: [{ type: "text", value }] }
}

function steps(node: ContainerDirective): FlowNode[] {
  const children = node.children as FlowNode[]
  const headingDepth = children.find((child): child is Heading => child.type === "heading")?.depth
  if (!headingDepth) return [element("docs-steps", [element("docs-step", children)])]

  const before: FlowNode[] = []
  const items: FlowNode[][] = []
  for (const child of children) {
    if (child.type === "heading" && child.depth === headingDepth) items.push([child])
    else if (items.length) items[items.length - 1].push(child)
    else before.push(child)
  }
  return [
    ...before,
    element(
      "docs-steps",
      items.map((item) => element("docs-step", item)),
    ),
  ]
}

function codeTabs(node: ContainerDirective): FlowNode[] {
  const code = node.children.filter((child): child is Code => child.type === "code")
  const rest = node.children.filter((child) => child.type !== "code") as FlowNode[]
  if (!code.length) return rest
  return [element("docs-code-tabs", code), ...rest]
}

function columns(node: ContainerDirective): FlowNode[] {
  const children = node.children as FlowNode[]
  const segments: FlowNode[][] = [[]]
  for (const child of children) {
    if (child.type === "thematicBreak") segments.push([])
    else segments[segments.length - 1].push(child)
  }
  const cells =
    segments.length > 1
      ? segments.filter((segment) => segment.length)
      : children.map((child) => [child])
  return [
    element(
      "docs-columns",
      cells.map((cell) => element("docs-column", cell)),
    ),
  ]
}

function transformDirective(node: Directive, source: string, insideLink: boolean): FlowNode[] {
  const attributes = node.attributes ?? {}

  if (node.type === "containerDirective") {
    switch (node.name) {
      case "steps":
        return steps(node)
      case "code-tabs":
        return codeTabs(node)
      case "columns":
        return columns(node)
      case "callout": {
        const { label, children } = splitLabel(node)
        return [
          element("docs-callout", children as FlowNode[], {
            type: oneOf(attributes.type, CALLOUT_TYPES, "info"),
            title: text(attributes.title) ?? text(label),
          }),
        ]
      }
      case "accordion": {
        const { label, children } = splitLabel(node)
        return [
          element("docs-accordion", children as FlowNode[], {
            title: text(attributes.title) ?? text(label) ?? "Detalles",
          }),
        ]
      }
      case "card": {
        const { label, children } = splitLabel(node)
        return [
          element("docs-card", children as FlowNode[], {
            title: text(attributes.title) ?? text(label),
            icon: text(attributes.icon, 40),
            href: safeHref(attributes.href),
          }),
        ]
      }
    }
  }

  if (node.type === "leafDirective" && node.name === "card") {
    return [
      element("docs-card", [], {
        title: text(attributes.title) ?? text(toString(node)),
        icon: text(attributes.icon, 40),
        href: safeHref(attributes.href),
      }),
    ]
  }

  if ((node.type === "textDirective" || node.type === "leafDirective") && node.name === "button") {
    // Dentro de un enlace no puede ir otro enlace (<a> dentro de <a>): solo el texto.
    if (insideLink) return [{ type: "text", value: toString(node) } as FlowNode]
    const button = element("docs-button", node.children as FlowNode[], {
      href: safeHref(attributes.href),
      variant: oneOf(attributes.variant, BUTTON_VARIANTS, "primary"),
    })
    // Un botón solo en su línea (leaf) va dentro de un párrafo para mantener el flujo.
    return node.type === "leafDirective"
      ? [{ type: "paragraph", children: [button as unknown as PhrasingContent] }]
      : [button]
  }

  return asText(node, source)
}

/** Recorre el árbol de abajo hacia arriba reemplazando cada directiva. */
function transformChildren(parent: Parent, source: string, insideLink = false) {
  const next: Node[] = []
  for (const child of parent.children) {
    if ("children" in child && Array.isArray(child.children)) {
      const isLink = child.type === "link" || child.type === "linkReference"
      transformChildren(child as Parent, source, insideLink || isLink)
    }
    if (isDirective(child)) next.push(...transformDirective(child, source, insideLink))
    else next.push(child)
  }
  parent.children = next as Parent["children"]
}

function visitLinksAndCode(node: Node) {
  if (node.type === "image" || node.type === "link" || node.type === "definition") {
    const target = node as Image | Link | Definition
    const resolved = attachmentUrl(target.url)
    if (resolved) target.url = resolved
  }
  if (node.type === "code") {
    const code = node as Code
    const title = code.meta?.match(/title=(?:"([^"]*)"|'([^']*)'|(\S+))/)
    const value = title?.[1] ?? title?.[2] ?? title?.[3]
    if (value) {
      code.data ??= {}
      code.data.hProperties = { ...code.data.hProperties, dataTitle: value.slice(0, 80) }
    }
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children as Node[]) visitLinksAndCode(child)
  }
}

export const remarkDocsDirectives: Plugin<[], Root> = function () {
  return (tree, file) => {
    visitLinksAndCode(tree)
    transformChildren(tree, String(file.value ?? ""))
  }
}

// Tipos usados solo para documentar qué nodos pueden ir dentro de los contenedores.
export type DirectiveChild = BlockContent | DefinitionContent
