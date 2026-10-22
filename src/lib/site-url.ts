import "server-only"

import { headers } from "next/headers"

/** URL pública del sitio para los enlaces de los correos. */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")
  // En producción en Vercel, el dominio del proyecto aunque la petición llegue
  // por la URL de un despliegue concreto (esas URL piden iniciar sesión en Vercel).
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (process.env.VERCEL_ENV === "production" && productionHost) return `https://${productionHost}`
  const requestHeaders = await headers()
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000"
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}
