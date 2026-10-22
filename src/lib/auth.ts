import "server-only"

import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { cache } from "react"

import { hasRole, type Role } from "@/lib/constants"
import { toDbError } from "@/lib/db-errors"
import { createClient } from "@/lib/supabase/server"

/** Un cliente de Supabase por petición, compartido por los Server Components. */
export const getSupabase = cache(createClient)

/**
 * Usuario actual validado contra Supabase Auth con getUser() (nunca solo
 * getSession(), que confía en la cookie sin verificarla).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/** Exige sesión; si no hay, manda a /login (y vuelve a `nextPath` después). */
export async function requireUser(nextPath?: string): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login")
  }
  return user
}

/** Rol del usuario actual en la organización, o null si no es miembro. */
export const getOrgRole = cache(async (orgId: string): Promise<Role | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (error) throw toDbError(error)
  return (data?.role as Role | undefined) ?? null
})

/**
 * Exige sesión y uno de los roles permitidos en la organización. Devuelve
 * null si no se cumple, para que cada llamador responda 404 o un error.
 */
export async function requireRole(
  orgId: string,
  allowed: readonly Role[],
): Promise<{ user: User; role: Role } | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const role = await getOrgRole(orgId)
  if (!hasRole(role, allowed)) return null
  return { user, role }
}
