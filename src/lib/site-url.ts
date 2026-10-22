import "server-only"

import { headers } from "next/headers"

/** URL pública del sitio para los enlaces de los correos. */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")
  const requestHeaders = await headers()
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000"
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}
