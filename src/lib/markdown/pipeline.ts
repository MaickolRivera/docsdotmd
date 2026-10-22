import rehypeSanitize from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import type { PluggableList } from "unified"

import { remarkDocsDirectives } from "./directives"
import { sanitizeSchema } from "./sanitize-schema"

// Plugins compartidos por el renderizador y la tabla "En esta página", para
// que los IDs de los títulos coincidan siempre.
//
// Orden: markdown con tablas/tareas y directivas -> componentes con nombre fijo
// -> HTML saneado -> IDs en los títulos (después de sanear, para que no se
// les agregue el prefijo "user-content-").

export const remarkPlugins: PluggableList = [remarkGfm, remarkDirective, remarkDocsDirectives]

export const rehypeSafePlugins: PluggableList = [[rehypeSanitize, sanitizeSchema], rehypeSlug]
