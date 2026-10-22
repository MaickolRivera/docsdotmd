function originOf(url: string | undefined): string {
  try {
    return url ? new URL(url).origin : ""
  } catch {
    return ""
  }
}

/** Une las fuentes de una directiva, omitiendo las que no aplican. */
function sources(...values: (string | false)[]): string {
  return values.filter(Boolean).join(" ")
}

/**
 * CSP básica sin nonces (Next.js y next-themes necesitan scripts en línea).
 * Se calcula en el proxy en cada petición, no en next.config: así siempre usa
 * la URL de Supabase vigente, aunque el .env se cree con el servidor ya
 * corriendo. Supabase se usa desde el navegador para la búsqueda (RPC con RLS)
 * y sirve las imágenes adjuntas con enlaces firmados.
 */
export function contentSecurityPolicy({ secure }: { secure: boolean }): string {
  const isDev = process.env.NODE_ENV === "development"
  const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL)
  // Las vistas previas de Vercel inyectan su barra de comentarios (vercel.live).
  // Solo se permite ahí; producción mantiene la política estricta.
  const toolbar = process.env.VERCEL_ENV === "preview"
  return [
    "default-src 'self'",
    `script-src ${sources("'self'", "'unsafe-inline'", isDev && "'unsafe-eval'", toolbar && "https://vercel.live")}`,
    `style-src ${sources("'self'", "'unsafe-inline'", toolbar && "https://vercel.live")}`,
    `img-src ${sources("'self'", "blob:", "data:", "https:", supabaseOrigin)}`,
    `font-src ${sources("'self'", "data:", toolbar && "https://vercel.live https://assets.vercel.com")}`,
    `connect-src ${sources("'self'", supabaseOrigin, toolbar && "https://vercel.live wss://ws-us3.pusher.com")}`,
    ...(toolbar ? ["frame-src https://vercel.live"] : []),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Solo cuando todo corre con HTTPS. En http://localhost el navegador subiría
    // a https las redirecciones del proxy, y en CI Supabase usa http.
    ...(secure && supabaseOrigin.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ].join("; ")
}
