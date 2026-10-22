import { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize"

// Esquema de rehype-sanitize: el de GitHub (sin HTML peligroso ni enlaces
// javascript:) más los componentes de DOCSmd con sus atributos permitidos.
// El markdown no admite HTML crudo: react-markdown lo muestra como texto y
// este esquema descarta cualquier otro elemento.

export const DOCS_ELEMENTS = {
  "docs-steps": [],
  "docs-step": [],
  "docs-code-tabs": [],
  "docs-callout": ["type", "title"],
  "docs-accordion": ["title"],
  "docs-card": ["title", "icon", "href"],
  "docs-button": ["href", "variant"],
  "docs-columns": [],
  "docs-column": [],
} as const satisfies Record<string, readonly string[]>

export const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...Object.keys(DOCS_ELEMENTS)],
  attributes: {
    ...defaultSchema.attributes,
    // className language-* ya viene en el esquema base; se agrega el título.
    code: [...(defaultSchema.attributes?.code ?? []), "dataTitle"],
    ...Object.fromEntries(
      Object.entries(DOCS_ELEMENTS).map(([tag, attributes]) => [tag, [...attributes]]),
    ),
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
}
