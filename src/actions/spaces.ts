"use server"

import { revalidatePath } from "next/cache"

import { requireOrgRole } from "@/lib/action-auth"
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import { ADMIN_ROLES } from "@/lib/constants"
import { dbFailure } from "@/lib/db-errors"
import { t } from "@/lib/i18n"
import { attachmentPaths, removeStorageObjects } from "@/lib/storage"
import { moveSchema, saveSpaceSchema, spaceIdSchema } from "@/lib/validators"

/** Crea o actualiza un espacio con sus grupos (RPC save_space, atómica). */
export async function saveSpace(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = saveSpaceSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { orgId, spaceId, name, slug, icon, visibility, groups } = parsed.data

  const auth = await requireOrgRole(orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { data, error } = await auth.supabase.rpc("save_space", {
    p_org: orgId,
    p_space: spaceId,
    p_name: name,
    p_slug: slug,
    p_icon: icon,
    p_visibility: visibility,
    p_groups: groups.map((group) => ({ group_id: group.groupId, permission: group.permission })),
  })
  if (error) {
    return dbFailure(error, { unique: { field: "slug", message: t.settings.spaces.slugTaken } })
  }
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok({ id: data })
}

/** Borra el espacio con sus páginas y adjuntos. */
export async function deleteSpace(input: unknown): Promise<ActionResult> {
  const parsed = spaceIdSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { data: pages } = await auth.supabase
    .from("pages")
    .select("id")
    .eq("space_id", parsed.data.spaceId)
  const paths = await attachmentPaths(auth.supabase, {
    column: "page_id",
    values: (pages ?? []).map((page) => page.id),
  })
  await removeStorageObjects(auth.supabase, paths)

  const { error } = await auth.supabase
    .from("spaces")
    .delete()
    .eq("id", parsed.data.spaceId)
    .eq("org_id", parsed.data.orgId)
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

/** Sube o baja un espacio en el orden de las pestañas. */
export async function moveSpace(input: unknown): Promise<ActionResult> {
  const parsed = spaceIdSchema.extend(moveSchema.shape).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ADMIN_ROLES)
  if (!auth.allowed) return auth.failure

  const { data: spaces, error: listError } = await auth.supabase
    .from("spaces")
    .select("id")
    .eq("org_id", parsed.data.orgId)
    .order("position")
    .order("name")
  if (listError) return dbFailure(listError)

  const ids = spaces.map((space) => space.id)
  const index = ids.indexOf(parsed.data.spaceId)
  const target = parsed.data.direction === "up" ? index - 1 : index + 1
  if (index < 0) return fail(t.common.notFound)
  if (target < 0 || target >= ids.length) return ok()
  ;[ids[index], ids[target]] = [ids[target], ids[index]]

  const { error } = await auth.supabase.rpc("reorder_spaces", {
    p_org: parsed.data.orgId,
    p_ids: ids,
  })
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}
