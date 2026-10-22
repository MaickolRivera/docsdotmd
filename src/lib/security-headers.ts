function originOf(url: string | undefined): string {
  try {
    return url ? new URL(url).origin : ""
  } catch {
    return ""
  }
}

/**
 * CSP básica sin nonces (Next.js y next-themes necesitan scripts en línea).
 * Se calcula en el proxy en cada petición, no en next.config: así siempre usa
 * la URL de Supabase vigente, aunque el .env se cree con el servidor ya
 * corriendo. Supabase se usa desde el navegador para la búsqueda (RPC con RLS)
 * y sirve las imágenes adjuntas con enlaces firmados.
 */
export function contentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV === "development"
  const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL)
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: https: ${supabaseOrigin}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Solo cuando todo corre con HTTPS (en local y en CI Supabase usa http).
    ...(supabaseOrigin.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ].join("; ")
}
