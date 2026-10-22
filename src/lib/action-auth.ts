import "server-only"

import type { User } from "@supabase/supabase-js"

import { fail, type ActionFailure } from "@/lib/action-result"
import { hasRole, type Role } from "@/lib/constants"
import { t } from "@/lib/i18n"
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server"

// Chequeos de permisos al inicio de cada Server Action. RLS vuelve a aplicar
// las mismas reglas en la base de datos; esto es la primera barrera y da un
// mensaje claro en vez de un error de Postgres.

type Denied = { allowed: false; failure: ActionFailure }

export type SessionContext = { allowed: true; supabase: ServerSupabaseClient; user: User }
export type OrgContext = SessionContext & {
  role: Role
  org: { id: string; slug: string; name: string }
}
export type SpaceContext = SessionContext & {
  space: { id: string; org_id: string; slug: string; org_slug: string }
}

const forbidden = (): Denied => ({ allowed: false, failure: fail(t.common.forbidden) })

export async function requireSession(): Promise<SessionContext | Denied> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return forbidden()
  return { allowed: true, supabase, user }
}

/** Sesión + uno de los roles permitidos en la organización. */
export async function requireOrgRole(
  orgId: string,
  roles: readonly Role[],
): Promise<OrgContext | Denied> {
  const session = await requireSession()
  if (!session.allowed) return session
  const { data, error } = await session.supabase
    .from("members")
    .select("role, organizations!inner(id, slug, name)")
    .eq("org_id", orgId)
    .eq("user_id", session.user.id)
    .maybeSingle()
  const role = data?.role as Role | undefined
  if (error || !data || !hasRole(role, roles)) return forbidden()
  return { ...session, role, org: data.organizations }
}

/** Sesión + permiso de edición en el espacio (rol y grupos, como can_edit_space). */
export async function requireSpaceEditor(spaceId: string): Promise<SpaceContext | Denied> {
  const session = await requireSession()
  if (!session.allowed) return session
  const [{ data: space }, { data: canEdit }] = await Promise.all([
    session.supabase
      .from("spaces")
      .select("id, org_id, slug, organizations!inner(slug)")
      .eq("id", spaceId)
      .maybeSingle(),
    session.supabase.rpc("can_edit_space", { p_space: spaceId }),
  ])
  if (!space || canEdit !== true) return forbidden()
  return {
    ...session,
    space: {
      id: space.id,
      org_id: space.org_id,
      slug: space.slug,
      org_slug: space.organizations.slug,
    },
  }
}
