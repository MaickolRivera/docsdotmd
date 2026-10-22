const DEFAULT_PATH = "/orgs"

/**
 * Devuelve una ruta interna segura para redirigir después de iniciar sesión.
 * Evita redirecciones abiertas (//otro-sitio.com, /\otro-sitio.com, http://...).
 */
export function safeRedirectPath(value: string | null | undefined, fallback = DEFAULT_PATH) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback
  }
  try {
    const url = new URL(value, "http://localhost")
    if (url.origin !== "http://localhost") return fallback
    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}
