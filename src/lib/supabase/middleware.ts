import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/redirect"
import type { Database } from "@/types/database"

import { getSupabaseEnv } from "./env"

/** Rutas que no requieren sesión. */
const PUBLIC_PATHS = ["/", "/guia", "/login", "/registro", "/recuperar", "/actualizar-clave"]
/** Formularios de acceso: con sesión no tiene sentido verlos. */
const GUEST_ONLY_PATHS = ["/login", "/registro", "/recuperar"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/")
}

/**
 * Refresca la sesión de Supabase en cada petición y protege las rutas
 * privadas. Se ejecuta desde src/proxy.ts antes de renderizar.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value)
      },
    },
  })

  // getUser() valida el token contra Supabase Auth (getSession() solo lee la cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  // Las rutas /api responden 401/404 por su cuenta; nunca se redirigen.
  if (pathname.startsWith("/api/")) return response

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", safeRedirectPath(`${pathname}${search}`))
    return redirectWithCookies(loginUrl, response)
  }

  if (user && GUEST_ONLY_PATHS.includes(pathname)) {
    const target = new URL(
      safeRedirectPath(request.nextUrl.searchParams.get("next")),
      request.nextUrl.origin,
    )
    return redirectWithCookies(target, response)
  }

  return response
}

/** Redirige conservando las cookies de sesión que Supabase acaba de refrescar. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie)
  return redirect
}
