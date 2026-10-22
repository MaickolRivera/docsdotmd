"use server"

import { revalidatePath } from "next/cache"

import { requireOrgRole } from "@/lib/action-auth"
import { invalid, ok, type ActionResult } from "@/lib/action-result"
import { ADMIN_ROLES } from "@/lib/constants"
import { dbFailure } from "@/lib/db-errors"
import { t } from "@/lib/i18n"
import {
  createGroupSchema,
  groupIdSchema,
  groupMemberSchema,
  renameGroupSchema,
} from "@/lib/validators"

const nameTaken = { unique: { field: "name", message: t.settings.groups.nameTaken } }

export async function createGroup(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createGroupSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { data, error } = await auth.supabase
    .from("groups")
    .insert({ org_id: parsed.data.orgId, name: parsed.data.name })
    .select("id")
    .single()
  if (error) return dbFailure(error, nameTaken)
  revalidatePath(`/${auth.org.slug}/ajustes`, "layout")
  return ok({ id: data.id })
}

export async function renameGroup(input: unknown): Promise<ActionResult> {
  const parsed = renameGroupSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase
    .from("groups")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.groupId)
    .eq("org_id", parsed.data.orgId)
  if (error) return dbFailure(error, nameTaken)
  revalidatePath(`/${auth.org.slug}/ajustes`, "layout")
  return ok()
}

export async function deleteGroup(input: unknown): Promise<ActionResult> {
  const parsed = groupIdSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase
    .from("groups")
    .delete()
    .eq("id", parsed.data.groupId)
    .eq("org_id", parsed.data.orgId)
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

export async function addGroupMember(input: unknown): Promise<ActionResult> {
  const parsed = groupMemberSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  // La clave foránea a members garantiza que la persona sea de la organización.
  const { error } = await auth.supabase
    .from("group_members")
    .upsert(
      { group_id: parsed.data.groupId, user_id: parsed.data.userId, org_id: parsed.data.orgId },
      { onConflict: "group_id,user_id", ignoreDuplicates: true },
    )
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

export async function removeGroupMember(input: unknown): Promise<ActionResult> {
  const parsed = groupMemberSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase
    .from("group_members")
    .delete()
    .eq("group_id", parsed.data.groupId)
    .eq("user_id", parsed.data.userId)
    .eq("org_id", parsed.data.orgId)
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}
