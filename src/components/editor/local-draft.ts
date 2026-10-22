import { PAGE_STATUSES, type PageStatus } from "@/lib/constants"

export type EditorFields = {
  title: string
  slug: string
  parentId: string | null
  status: PageStatus
  content: string
}

export type LocalDraft = EditorFields & { savedAt: number }

const key = (pageId: string) => `docsmd:draft:${pageId}`

export function sameFields(a: EditorFields, b: EditorFields) {
  return (
    a.title.trim() === b.title.trim() &&
    a.slug.trim() === b.slug.trim() &&
    a.parentId === b.parentId &&
    a.status === b.status &&
    a.content === b.content
  )
}

/** Borrador local más reciente que la versión guardada, si existe. */
export function readLocalDraft(
  pageId: string,
  saved: EditorFields,
  savedAt: string,
): LocalDraft | null {
  try {
    const raw = localStorage.getItem(key(pageId))
    if (!raw) return null
    const draft = JSON.parse(raw) as Partial<LocalDraft>
    const valid =
      typeof draft.title === "string" &&
      typeof draft.slug === "string" &&
      typeof draft.content === "string" &&
      typeof draft.savedAt === "number" &&
      (draft.parentId === null || typeof draft.parentId === "string") &&
      PAGE_STATUSES.includes(draft.status as PageStatus)
    if (!valid) return null
    const parsed = draft as LocalDraft
    if (parsed.savedAt <= Date.parse(savedAt) || sameFields(parsed, saved)) {
      localStorage.removeItem(key(pageId))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeLocalDraft(pageId: string, fields: EditorFields) {
  try {
    localStorage.setItem(key(pageId), JSON.stringify({ ...fields, savedAt: Date.now() }))
  } catch {
    // Sin almacenamiento (modo privado, cuota llena): el guardado normal sigue funcionando.
  }
}

export function clearLocalDraft(pageId: string) {
  try {
    localStorage.removeItem(key(pageId))
  } catch {
    // Igual que arriba.
  }
}
