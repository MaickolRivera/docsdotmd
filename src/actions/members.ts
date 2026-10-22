"use server"

import { createHash, randomBytes } from "node:crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireOrgRole, requireSession } from "@/lib/action-auth"
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import { ADMIN_ROLES, INVITATION_TTL_DAYS, type Role } from "@/lib/constants"
import { dbFailure } from "@/lib/db-errors"
import { sendInvitationEmail } from "@/lib/email"
import { t } from "@/lib/i18n"
import { getSiteUrl } from "@/lib/site-url"
import type { ServerSupabaseClient } from "@/lib/supabase/server"
import {
  changeRoleSchema,
  invitationIdSchema,
  invitationTokenSchema,
  inviteSchema,
  memberSchema,
} from "@/lib/validators"

function hashInvitationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

/**
 * Crea una invitación: token aleatorio de un solo uso, guardado como hash,
 * que vence en 7 días. Devuelve el enlace para mostrarlo una sola vez.
 */
export async function inviteMember(
  input: unknown,
): Promise<ActionResult<{ link: string; emailSent: boolean }>> {
  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { orgId, email, role } = parsed.data

  const auth = await requireOrgRole(orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure
  if (auth.role === "admin" && role === "owner") return fail(t.settings.members.cannotManageOwners)

  const { data: existing } = await auth.supabase
    .from("members")
    .select("user_id, profiles!inner(email)")
    .eq("org_id", orgId)
    .eq("profiles.email", email)
    .maybeSingle()
  if (existing) {
    return fail(t.settings.members.alreadyMember, { email: t.settings.members.alreadyMember })
  }

  // Una sola invitación pendiente por correo: la nueva reemplaza a la anterior.
  await auth.supabase
    .from("invitations")
    .delete()
    .eq("org_id", orgId)
    .eq("email", email)
    .is("accepted_at", null)

  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const { error } = await auth.supabase.from("invitations").insert({
    org_id: orgId,
    email,
    role,
    token_hash: hashInvitationToken(token),
    invited_by: auth.user.id,
    expires_at: expiresAt.toISOString(),
  })
  if (error) return dbFailure(error)

  const link = `${await getSiteUrl()}/invitacion/${token}`
  const emailSent = await sendInvitationEmail({
    to: email,
    orgName: auth.org.name,
    role: t.roles[role],
    link,
  })
  revalidatePath(`/${auth.org.slug}/ajustes/miembros`)
  return ok({ link, emailSent })
}

export async function revokeInvitation(input: unknown): Promise<ActionResult> {
  const parsed = invitationIdSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase
    .from("invitations")
    .delete()
    .eq("id", parsed.data.invitationId)
    .eq("org_id", parsed.data.orgId)
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}/ajustes/miembros`)
  return ok()
}

async function targetRole(
  supabase: ServerSupabaseClient,
  orgId: string,
  userId: string,
): Promise<Role | null> {
  const { data } = await supabase
    .from("members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.role as Role | undefined) ?? null
}

/** Owner cambia cualquier rol; admin solo roles que no son owner. */
export async function changeMemberRole(input: unknown): Promise<ActionResult> {
  const parsed = changeRoleSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { orgId, userId, role } = parsed.data

  const auth = await requireOrgRole(orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const current = await targetRole(auth.supabase, orgId, userId)
  if (!current) return fail(t.common.notFound)
  if (auth.role === "admin" && (current === "owner" || role === "owner")) {
    return fail(t.settings.members.cannotManageOwners)
  }

  const { data, error } = await auth.supabase
    .from("members")
    .update({ role })
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .select("user_id")
  if (error) return dbFailure(error)
  if (!data.length) return fail(t.common.forbidden)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

/** Quita a un miembro. Admin no puede quitar owners; nadie quita al último owner. */
export async function removeMember(input: unknown): Promise<ActionResult> {
  const parsed = memberSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { orgId, userId } = parsed.data

  const auth = await requireOrgRole(orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const current = await targetRole(auth.supabase, orgId, userId)
  if (!current) return fail(t.common.notFound)
  if (auth.role === "admin" && current === "owner")
    return fail(t.settings.members.cannotManageOwners)

  const { data, error } = await auth.supabase
    .from("members")
    .delete()
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .select("user_id")
  if (error) return dbFailure(error)
  if (!data.length) return fail(t.common.forbidden)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

/** Acepta la invitación (RPC accept_invitation) y entra a la organización. */
export async function acceptInvitation(input: unknown): Promise<ActionResult> {
  const parsed = invitationTokenSchema.safeParse(input)
  if (!parsed.success) return fail(t.invitation.invalid)

  const session = await requireSession()
  if (!session.allowed) return session.failure

  const { data: slug, error } = await session.supabase.rpc("accept_invitation", {
    p_token: parsed.data.token,
  })
  if (error) return dbFailure(error)
  revalidatePath("/", "layout")
  redirect(`/${slug}`)
}
