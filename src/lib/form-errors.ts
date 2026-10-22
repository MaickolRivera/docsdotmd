import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import type { ActionFailure } from "@/lib/action-result"

/**
 * Pasa los errores por campo que devolvió una Server Action al formulario.
 * Devuelve true si alguno correspondía a un campo del formulario.
 */
export function applyFieldErrors<T extends FieldValues>(
  result: ActionFailure,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  let applied = false
  for (const [key, message] of Object.entries(result.fieldErrors ?? {})) {
    if ((fields as readonly string[]).includes(key)) {
      setError(key as Path<T>, { type: "server", message })
      applied = true
    }
  }
  return applied
}
