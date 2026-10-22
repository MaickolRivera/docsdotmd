import "server-only"

import { cache } from "react"

import { getCurrentUser, getSupabase } from "@/lib/auth"
import type { Role, SpacePermission, SpaceVisibility } from "@/lib/constants"
import { toDbError } from "@/lib/db-errors"

// Lecturas para Server Components. Todas pasan por RLS con la sesión del
// usuario: si algo no le corresponde, simplemente no aparece (y la página
// responde 404). React cache() evita repetir consultas en la misma petición.

export type OrgSummary = { id: string; name: string; slug: string; logo_url: string | null }

export type OrgContext = {
  org: OrgSummary
  role: Role
  userId: string
}

export type SpaceSummary = {
  id: string
  org_id: string
  name: string
  slug: string
  icon: string
  visibility: SpaceVisibility
  position: number
}

/** Organización por slug, solo si el usuario actual es miembro. */
export const getOrgContext = cache(async (orgSlug: string): Promise<OrgContext | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("members")
    .select("role, organizations!inner(id, name, slug, logo_url)")
    .eq("user_id", user.id)
    .eq("organizations.slug", orgSlug)
    .maybeSingle()
  if (error) throw toDbError(error)
  if (!data) return null
  return { org: data.organizations, role: data.role as Role, userId: user.id }
})

/** Organizaciones del usuario actual con su rol, ordenadas por nombre. */
export const getUserOrgs = cache(async (): Promise<(OrgSummary & { role: Role })[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("members")
    .select("role, organizations!inner(id, name, slug, logo_url)")
    .eq("user_id", user.id)
  if (error) throw toDbError(error)
  return data
    .map((row) => ({ ...row.organizations, role: row.role as Role }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
})

export const getProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle()
  if (error) throw toDbError(error)
  return data ?? { id: user.id, full_name: "", email: user.email ?? "", avatar_url: null }
})

/** Espacios que el usuario puede ver, en el orden de las pestañas. */
export const getSpaces = cache(async (orgId: string): Promise<SpaceSummary[]> => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("spaces")
    .select("id, org_id, name, slug, icon, visibility, position")
    .eq("org_id", orgId)
    .order("position")
    .order("name")
  if (error) throw toDbError(error)
  return data as SpaceSummary[]
})

// ---------------------------------------------------------------------------
// Administración (solo owner y admin pasan RLS en invitaciones y accesos)
// ---------------------------------------------------------------------------

export type OrgMember = {
  userId: string
  role: Role
  joinedAt: string
  fullName: string
  email: string
}

export const getOrgMembers = cache(async (orgId: string): Promise<OrgMember[]> => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("members")
    .select("user_id, role, joined_at, profiles!members_user_id_fkey(full_name, email)")
    .eq("org_id", orgId)
  if (error) throw toDbError(error)
  return data
    .map((row) => ({
      userId: row.user_id,
      role: row.role as Role,
      joinedAt: row.joined_at,
      fullName: row.profiles.full_name,
      email: row.profiles.email,
    }))
    .sort((a, b) => (a.fullName || a.email).localeCompare(b.fullName || b.email, "es"))
})

export const getPendingInvitations = cache(async (orgId: string) => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw toDbError(error)
  return data.map((row) => ({ ...row, role: row.role as Role }))
})

export const getGroups = cache(async (orgId: string) => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, group_members(user_id)")
    .eq("org_id", orgId)
    .order("name")
  if (error) throw toDbError(error)
  return data.map((group) => ({
    id: group.id,
    name: group.name,
    memberIds: group.group_members.map((member) => member.user_id),
  }))
})

export const getSpacesWithAccess = cache(async (orgId: string) => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("spaces")
    .select("id, name, slug, icon, visibility, position, space_groups(group_id, permission)")
    .eq("org_id", orgId)
    .order("position")
    .order("name")
  if (error) throw toDbError(error)
  return data.map((space) => ({
    id: space.id,
    name: space.name,
    slug: space.slug,
    icon: space.icon,
    visibility: space.visibility as SpaceVisibility,
    groups: space.space_groups.map((access) => ({
      groupId: access.group_id,
      permission: access.permission as SpacePermission,
    })),
  }))
})
