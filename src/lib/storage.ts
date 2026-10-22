import "server-only"

import { ATTACHMENTS_BUCKET } from "@/lib/constants"
import type { ServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Borra archivos del bucket privado. Postgres no permite borrar objetos de
 * Storage desde SQL, así que antes de borrar páginas, espacios u
 * organizaciones se eliminan aquí sus adjuntos (con la sesión del usuario: las
 * políticas de storage.objects deciden si puede).
 */
export async function removeStorageObjects(supabase: ServerSupabaseClient, paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    const chunk = paths.slice(i, i + 100)
    const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).remove(chunk)
    if (error) console.error("[storage] remove", error.message)
  }
}

export async function attachmentPaths(
  supabase: ServerSupabaseClient,
  filter: { column: "org_id" | "page_id"; values: string[] },
): Promise<string[]> {
  if (!filter.values.length) return []
  const { data, error } = await supabase
    .from("attachments")
    .select("storage_path")
    .in(filter.column, filter.values)
  if (error) {
    console.error("[storage] list", error.message)
    return []
  }
  return data.map((row) => row.storage_path)
}
