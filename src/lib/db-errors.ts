import "server-only"

import { fail, type ActionFailure } from "@/lib/action-result"
import { t } from "@/lib/i18n"

type DbError =
  | { code?: string; message?: string; details?: string | null; hint?: string | null }
  | null
  | undefined

/** Tabla o función que no existe en la base: las migraciones no están aplicadas. */
const MISSING_SCHEMA_CODES = ["PGRST202", "PGRST205", "42P01", "42883"]

/**
 * Error legible para lanzar desde Server Components. PostgREST devuelve objetos
 * planos ({ code, message }) que el overlay de Next.js muestra sin el texto.
 */
export function toDbError(error: NonNullable<DbError>): Error {
  const code = error.code ?? "db"
  const hint = MISSING_SCHEMA_CODES.includes(code)
    ? "¿Aplicaste las migraciones de supabase/migrations? (pnpm db:push)"
    : error.hint
  return new Error(
    `[${code}] ${error.message ?? "Error de base de datos"}${hint ? ` — ${hint}` : ""}`,
  )
}

type Overrides = {
  /** Mensaje para una violación de unicidad (23505), por campo. */
  unique?: { field: string; message: string }
  notFound?: string
}

/**
 * Traduce un error de Postgres/PostgREST a un mensaje para la interfaz. Los
 * detalles técnicos se registran en el servidor y no se envían al navegador.
 */
export function dbFailure(error: DbError, overrides: Overrides = {}): ActionFailure {
  const code = error?.code ?? ""
  const message = error?.message ?? ""

  if (code === "23505" && overrides.unique) {
    return fail(overrides.unique.message, { [overrides.unique.field]: overrides.unique.message })
  }
  if (message.includes("last_owner")) return fail(t.settings.members.lastOwner)
  if (message.includes("page_cycle")) return fail(t.editor.cycle, { parentId: t.editor.cycle })
  if (message.includes("slug_not_reserved")) {
    return fail(t.validation.slugReserved, { slug: t.validation.slugReserved })
  }
  if (message.includes("slug_format"))
    return fail(t.validation.slugFormat, { slug: t.validation.slugFormat })
  if (message.includes("invalid_invitation")) return fail(t.invitation.invalid)
  if (message.includes("expired_invitation")) return fail(t.invitation.expired)
  if (message.includes("email_mismatch")) return fail(t.invitation.invalid)
  if (code === "42501" || message.includes("row-level security") || message.includes("forbidden")) {
    return fail(t.common.forbidden)
  }
  if (code === "PGRST116" || code === "P0002") return fail(overrides.notFound ?? t.common.notFound)

  console.error("[db]", code, message, error?.details ?? "")
  return fail(t.common.genericError)
}
