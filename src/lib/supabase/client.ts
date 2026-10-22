import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database"

import { getSupabaseEnv } from "./env"

/**
 * Cliente de Supabase para el navegador. Lee la sesión de las mismas cookies
 * que el servidor y solo ve lo que RLS permite (se usa para la búsqueda).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}
