import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"

import { getSupabaseEnv } from "./env"

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Usa la sesión del usuario guardada en cookies, así que RLS aplica siempre.
 * Se crea uno nuevo en cada petición; nunca se comparte entre usuarios.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Los Server Components no pueden escribir cookies; el proxy ya
          // refrescó la sesión en esta misma petición.
        }
      },
    },
  })
}

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>
