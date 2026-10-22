// Valores del dominio compartidos por el cliente y el servidor. Deben coincidir
// con las restricciones de supabase/migrations.

export const ROLES = ["owner", "admin", "editor", "viewer"] as const
export type Role = (typeof ROLES)[number]

export const SPACE_VISIBILITIES = ["org", "restricted"] as const
export type SpaceVisibility = (typeof SPACE_VISIBILITIES)[number]

export const SPACE_PERMISSIONS = ["read", "edit"] as const
export type SpacePermission = (typeof SPACE_PERMISSIONS)[number]

export const PAGE_STATUSES = ["draft", "published"] as const
export type PageStatus = (typeof PAGE_STATUSES)[number]

/** Slugs que chocan con rutas de la aplicación. */
export const RESERVED_ORG_SLUGS = [
  "orgs",
  "login",
  "logout",
  "registro",
  "recuperar",
  "actualizar-clave",
  "auth",
  "invitacion",
  "api",
  "ajustes",
  "admin",
  "app",
  "static",
  "public",
  "assets",
  "ayuda",
  "help",
  "docs",
  "nueva",
  "new",
] as const
export const RESERVED_SPACE_SLUGS = ["ajustes"] as const
export const RESERVED_PAGE_SLUGS = ["editar"] as const

export const PAGE_CONTENT_MAX_LENGTH = 200_000
export const INVITATION_TTL_DAYS = 7

export const ATTACHMENTS_BUCKET = "attachments"
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
export const SIGNED_URL_TTL_SECONDS = 60

/** Tipos permitidos para adjuntos (también configurados en el bucket). */
export const ATTACHMENT_MIME_TYPES: Record<string, readonly string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
  "text/plain": ["txt", "log"],
  "text/markdown": ["md", "markdown"],
  "text/csv": ["csv"],
}

export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_MIME_TYPES).join(",")

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

export function hasRole(role: Role | null | undefined, allowed: readonly Role[]): role is Role {
  return role != null && allowed.includes(role)
}

export const ADMIN_ROLES = ["owner", "admin"] as const satisfies readonly Role[]
