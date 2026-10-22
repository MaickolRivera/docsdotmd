"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession, requireSpaceEditor } from "@/lib/action-auth"
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import type { PageStatus } from "@/lib/constants"
import { dbFailure, toDbError } from "@/lib/db-errors"
import { t } from "@/lib/i18n"
import {
  buildPageTree,
  descendantIds,
  editorHref,
  flattenTree,
  pageHref,
  type PageListItem,
} from "@/lib/pages-tree"
import { slugify, uniqueSlug } from "@/lib/slug"
import { attachmentPaths, removeStorageObjects } from "@/lib/storage"
import type { ServerSupabaseClient } from "@/lib/supabase/server"
import { createPageSchema, moveSchema, pageIdSchema, savePageSchema } from "@/lib/validators"

async function listPages(supabase: ServerSupabaseClient, spaceId: string): Promise<PageListItem[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, parent_id, title, slug, status, position")
    .eq("space_id", spaceId)
  if (error) throw toDbError(error)
  return data.map((page) => ({ ...page, status: page.status as PageStatus }))
}

/** Página por id (RLS decide si el usuario la ve). */
async function findPage(supabase: ServerSupabaseClient, pageId: string) {
  const { data } = await supabase
    .from("pages")
    .select("id, space_id, parent_id, slug")
    .eq("id", pageId)
    .maybeSingle()
  return data
}

function nextPosition(pages: PageListItem[], parentId: string | null) {
  const siblings = pages.filter((page) => page.parent_id === parentId)
  return siblings.length ? Math.max(...siblings.map((page) => page.position)) + 1 : 0
}

/** Crea una página en borrador y devuelve la ruta de su editor. */
export async function createPage(input: unknown): Promise<ActionResult<{ href: string }>> {
  const parsed = createPageSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { spaceId, parentId } = parsed.data

  const auth = await requireSpaceEditor(spaceId)
  if (!auth.allowed) return auth.failure

  const pages = await listPages(auth.supabase, spaceId)
  if (parentId && !pages.some((page) => page.id === parentId)) return fail(t.common.notFound)

  const title = t.editor.newPageTitle
  const { data, error } = await auth.supabase
    .from("pages")
    .insert({
      org_id: auth.space.org_id,
      space_id: spaceId,
      parent_id: parentId,
      title,
      slug: uniqueSlug(
        slugify(title),
        pages.map((page) => page.slug),
      ),
      status: "draft",
      position: nextPosition(pages, parentId),
      content_md: "",
    })
    .select("id")
    .single()
  if (error) return dbFailure(error)

  revalidatePath(`/${auth.space.org_slug}/${auth.space.slug}`, "layout")
  return ok({ href: editorHref(auth.space.org_slug, auth.space.slug, data.id) })
}

/** Guarda título, slug, página padre, estado y contenido. */
export async function savePage(
  input: unknown,
): Promise<ActionResult<{ href: string; updatedAt: string }>> {
  const parsed = savePageSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { pageId, title, slug, parentId, status, content } = parsed.data

  const session = await requireSession()
  if (!session.allowed) return session.failure
  const page = await findPage(session.supabase, pageId)
  if (!page) return fail(t.common.notFound)

  // La Server Action vuelve a comprobar el permiso aunque RLS también lo haga.
  const auth = await requireSpaceEditor(page.space_id)
  if (!auth.allowed) return auth.failure
  if (parentId === pageId) return fail(t.editor.cycle, { parentId: t.editor.cycle })

  const pages = await listPages(auth.supabase, page.space_id)
  if (parentId && !pages.some((item) => item.id === parentId)) return fail(t.common.notFound)
  const parentChanged = parentId !== page.parent_id

  const { data, error } = await auth.supabase
    .from("pages")
    .update({
      title,
      slug,
      parent_id: parentId,
      status,
      content_md: content,
      ...(parentChanged ? { position: nextPosition(pages, parentId) } : {}),
    })
    .eq("id", pageId)
    .select("updated_at")
    .single()
  if (error) return dbFailure(error, { unique: { field: "slug", message: t.editor.slugTaken } })

  const updated = pages.map((item) =>
    item.id === pageId ? { ...item, slug, parent_id: parentId, title } : item,
  )
  const node = flattenTree(buildPageTree(updated)).find((item) => item.id === pageId)
  revalidatePath(`/${auth.space.org_slug}/${auth.space.slug}`, "layout")
  return ok({
    href: node
      ? pageHref(auth.space.org_slug, auth.space.slug, node)
      : `/${auth.space.org_slug}/${auth.space.slug}`,
    updatedAt: data.updated_at,
  })
}

/** Borra la página, sus subpáginas y los archivos adjuntos de todas. */
export async function deletePage(input: unknown): Promise<ActionResult> {
  const parsed = pageIdSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const session = await requireSession()
  if (!session.allowed) return session.failure
  const page = await findPage(session.supabase, parsed.data.pageId)
  if (!page) return fail(t.common.notFound)

  const auth = await requireSpaceEditor(page.space_id)
  if (!auth.allowed) return auth.failure

  const pages = await listPages(auth.supabase, page.space_id)
  const ids = [page.id, ...descendantIds(pages, page.id)]
  await removeStorageObjects(
    auth.supabase,
    await attachmentPaths(auth.supabase, { column: "page_id", values: ids }),
  )

  const { error } = await auth.supabase.from("pages").delete().eq("id", page.id)
  if (error) return dbFailure(error)

  revalidatePath(`/${auth.space.org_slug}/${auth.space.slug}`, "layout")
  redirect(`/${auth.space.org_slug}/${auth.space.slug}`)
}

/** Sube o baja una página entre sus hermanas (mismo padre). */
export async function movePage(input: unknown): Promise<ActionResult> {
  const parsed = pageIdSchema.extend(moveSchema.shape).safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const session = await requireSession()
  if (!session.allowed) return session.failure
  const page = await findPage(session.supabase, parsed.data.pageId)
  if (!page) return fail(t.common.notFound)

  const auth = await requireSpaceEditor(page.space_id)
  if (!auth.allowed) return auth.failure

  const pages = await listPages(auth.supabase, page.space_id)
  const siblings = pages
    .filter((item) => item.parent_id === page.parent_id)
    .sort((a, b) => a.position - b.position || a.title.localeCompare(b.title, "es"))
    .map((item) => item.id)
  const index = siblings.indexOf(page.id)
  const target = parsed.data.direction === "up" ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= siblings.length) return ok()
  ;[siblings[index], siblings[target]] = [siblings[target], siblings[index]]

  const { error } = await auth.supabase.rpc("reorder_pages", {
    p_space: page.space_id,
    p_ids: siblings,
    p_parent: page.parent_id ?? undefined,
  })
  if (error) return dbFailure(error)
  revalidatePath(`/${auth.space.org_slug}/${auth.space.slug}`, "layout")
  return ok()
}
