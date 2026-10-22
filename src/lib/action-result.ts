import type { ZodError } from "zod"

import { t } from "@/lib/i18n"

// Resultado que devuelven todas las Server Actions. Nunca se lanza un error
// hacia el cliente: siempre vuelve un mensaje que se puede mostrar.

export type FieldErrors = Record<string, string>

export type ActionFailure = { ok: false; error: string; fieldErrors?: FieldErrors }
export type ActionResult<T = null> = { ok: true; data: T } | ActionFailure

export function ok(): ActionResult<null>
export function ok<T>(data: T): ActionResult<T>
export function ok<T>(data?: T): ActionResult<T | null> {
  return { ok: true, data: data ?? null }
}

export function fail(error: string, fieldErrors?: FieldErrors): ActionFailure {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error }
}

/** Errores de Zod -> un mensaje por campo (el primero). */
export function invalid(error: ZodError): ActionFailure {
  const fieldErrors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    fieldErrors[key] ??= issue.message
  }
  return fail(t.common.invalidData, fieldErrors)
}
