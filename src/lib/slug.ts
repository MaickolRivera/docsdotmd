/** Convierte un texto en slug: minúsculas, sin tildes, palabras unidas por guiones. */
export function slugify(text: string, maxLength = 48): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "")
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Devuelve `base`, o `base-2`, `base-3`… si ya está en uso. */
export function uniqueSlug(base: string, taken: Iterable<string>, maxLength = 80): string {
  const used = new Set(taken)
  const root = base || "pagina"
  if (!used.has(root)) return root
  for (let n = 2; ; n++) {
    const suffix = `-${n}`
    const candidate = `${root.slice(0, maxLength - suffix.length)}${suffix}`
    if (!used.has(candidate)) return candidate
  }
}
