"use server"

import { randomUUID } from "node:crypto"

import { requireSession, requireSpaceEditor } from "@/lib/action-auth"
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import { ATTACHMENTS_BUCKET, isImageMimeType } from "@/lib/constants"
import { dbFailure } from "@/lib/db-errors"
import { checkAttachment } from "@/lib/file-check"
import { t } from "@/lib/i18n"
import { slugify } from "@/lib/slug"
import { attachmentIdSchema, idSchema } from "@/lib/validators"

export type UploadedAttachment = {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  markdown: string
}

function markdownFor(id: string, fileName: string, mimeType: string) {
  const label = fileName.replace(/[[\]\\]/g, "")
  return isImageMimeType(mimeType)
    ? `![${label}](attachment:${id})`
    : `[${label}](attachment:${id})`
}

/**
 * Sube un archivo al bucket privado (ruta org_id/page_id/archivo) y lo
 * registra en attachments. Las políticas de Storage y RLS vuelven a validar
 * que el usuario pueda editar la página.
 */
export async function uploadAttachment(
  formData: FormData,
): Promise<ActionResult<UploadedAttachment>> {
  const pageId = idSchema.safeParse(formData.get("pageId"))
  if (!pageId.success) return invalid(pageId.error)
  const file = formData.get("file")
  if (!(file instanceof File)) return fail(t.editor.attachments.typeNotAllowed)

  const check = await checkAttachment(file)
  if (!check.ok) {
    return fail(
      check.reason === "size" ? t.editor.attachments.tooLarge : t.editor.attachments.typeNotAllowed,
    )
  }

  const session = await requireSession()
  if (!session.allowed) return session.failure
  const { data: page } = await session.supabase
    .from("pages")
    .select("id, org_id, space_id")
    .eq("id", pageId.data)
    .maybeSingle()
  if (!page) return fail(t.common.notFound)

  const auth = await requireSpaceEditor(page.space_id)
  if (!auth.allowed) return auth.failure

  const id = randomUUID()
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ""), 60) || "archivo"
  const storagePath = `${page.org_id}/${page.id}/${id}-${baseName}.${check.extension}`
  const fileName = file.name.trim().slice(0, 200) || `${baseName}.${check.extension}`

  const { error: uploadError } = await auth.supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(storagePath, file, { contentType: check.mimeType, upsert: false, cacheControl: "3600" })
  if (uploadError) {
    console.error("[attachments] upload", uploadError.message)
    return fail(t.common.genericError)
  }

  const { error } = await auth.supabase.from("attachments").insert({
    id,
    org_id: page.org_id,
    page_id: page.id,
    storage_path: storagePath,
    file_name: fileName,
    mime_type: check.mimeType,
    size_bytes: file.size,
    created_by: auth.user.id,
  })
  if (error) {
    await auth.supabase.storage.from(ATTACHMENTS_BUCKET).remove([storagePath])
    return dbFailure(error)
  }

  return ok({
    id,
    fileName,
    mimeType: check.mimeType,
    sizeBytes: file.size,
    markdown: markdownFor(id, fileName, check.mimeType),
  })
}

export async function deleteAttachment(input: unknown): Promise<ActionResult> {
  const parsed = attachmentIdSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const session = await requireSession()
  if (!session.allowed) return session.failure
  const { data: attachment } = await session.supabase
    .from("attachments")
    .select("id, storage_path, pages!inner(space_id)")
    .eq("id", parsed.data.attachmentId)
    .maybeSingle()
  if (!attachment) return fail(t.common.notFound)

  const auth = await requireSpaceEditor(attachment.pages.space_id)
  if (!auth.allowed) return auth.failure

  const { error: storageError } = await auth.supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([attachment.storage_path])
  if (storageError) console.error("[attachments] remove", storageError.message)

  const { error } = await auth.supabase.from("attachments").delete().eq("id", attachment.id)
  if (error) return dbFailure(error)
  return ok()
}
