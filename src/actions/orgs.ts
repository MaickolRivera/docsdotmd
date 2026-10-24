"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireOrgRole, requireSession } from "@/lib/action-auth"
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import { ROLES } from "@/lib/constants"
import { dbFailure } from "@/lib/db-errors"
import { t } from "@/lib/i18n"
import { slugify } from "@/lib/slug"
import { attachmentPaths, removeStorageObjects } from "@/lib/storage"
import {
  deleteOrgSchema,
  idSchema,
  memberSchema,
  newOrgSchema,
  orgFormSchema,
  updateOrgSchema,
} from "@/lib/validators"

const MAX_SLUG_ATTEMPTS = 9

/** Crea la organización (RPC create_organization) y entra a ella. */
export async function createOrganization(input: unknown): Promise<ActionResult> {
  const parsed = newOrgSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  // La dirección sale del nombre; si ya está en uso se prueba con -2, -3…
  const base = slugify(parsed.data.name)
  const check = orgFormSchema.safeParse({ name: parsed.data.name, slug: base })
  if (!check.success) {
    const message = check.error.issues[0]?.message ?? t.orgs.newPage.invalidName
    return fail(message, { name: message })
  }

  const session = await requireSession()
  if (!session.allowed) return session.failure

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 1 ? base : `${base.slice(0, 48 - 3)}-${attempt}`
    const { data, error } = await session.supabase.rpc("create_organization", {
      p_name: parsed.data.name,
      p_slug: slug,
    })
    if (!error) redirect(`/${data}`)
    if (error.code !== "23505") return dbFailure(error)
  }
  return fail(t.orgs.newPage.tooManySimilar, { name: t.orgs.newPage.tooManySimilar })
}

/** Renombra la organización o cambia su dirección. Solo owner. */
export async function updateOrganization(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const parsed = updateOrgSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ["owner"])
  if (!auth.allowed) return auth.failure

  const { data, error } = await auth.supabase
    .from("organizations")
    .update({ name: parsed.data.name, slug: parsed.data.slug })
    .eq("id", parsed.data.orgId)
    .select("slug")
    .single()
  if (error) {
    return dbFailure(error, { unique: { field: "slug", message: t.orgs.newPage.slugTaken } })
  }
  revalidatePath("/", "layout")
  return ok({ slug: data.slug })
}

/** El owner actual pasa a admin y el miembro elegido queda como owner. */
export async function transferOwnership(input: unknown): Promise<ActionResult> {
  const parsed = memberSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ["owner"])
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase.rpc("transfer_ownership", {
    p_org: parsed.data.orgId,
    p_user: parsed.data.userId,
  })
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.org.slug}`, "layout")
  return ok()
}

/** Salir de la organización (el trigger impide que salga el último owner). */
export async function leaveOrganization(orgId: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(orgId)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data, ROLES)
  if (!auth.allowed) return auth.failure

  const { error } = await auth.supabase
    .from("members")
    .delete()
    .eq("org_id", parsed.data)
    .eq("user_id", auth.user.id)
  if (error) return dbFailure(error)
  revalidatePath("/", "layout")
  redirect("/orgs")
}

/** Borra la organización con todo su contenido y archivos. Solo owner. */
export async function deleteOrganization(input: unknown): Promise<ActionResult> {
  const parsed = deleteOrgSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const auth = await requireOrgRole(parsed.data.orgId, ["owner"])
  if (!auth.allowed) return auth.failure
  if (parsed.data.confirmSlug !== auth.org.slug) {
    return fail(t.settings.general.deleteMismatch, {
      confirmSlug: t.settings.general.deleteMismatch,
    })
  }

  const paths = await attachmentPaths(auth.supabase, { column: "org_id", values: [auth.org.id] })
  await removeStorageObjects(auth.supabase, paths)

  const { error } = await auth.supabase.from("organizations").delete().eq("id", auth.org.id)
  if (error) return dbFailure(error)
  revalidatePath("/", "layout")
  redirect("/orgs")
}
