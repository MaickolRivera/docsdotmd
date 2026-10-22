import "server-only"

import { ATTACHMENT_MAX_BYTES, ATTACHMENT_MIME_TYPES } from "@/lib/constants"

export type FileCheck =
  { ok: true; mimeType: string; extension: string } | { ok: false; reason: "size" | "type" }

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

/** Comprueba que el contenido corresponda al tipo declarado (firma binaria). */
function matchesSignature(mimeType: string, bytes: Uint8Array): boolean {
  switch (mimeType) {
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff])
    case "image/gif":
      return startsWith(bytes, [0x47, 0x49, 0x46, 0x38])
    case "image/webp":
      return (
        startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      )
    case "application/pdf":
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46])
    default:
      // Texto: sin bytes nulos al inicio.
      return !bytes.subarray(0, 4096).includes(0)
  }
}

/** Valida tamaño, tipo declarado, extensión y contenido del archivo. */
export async function checkAttachment(file: File): Promise<FileCheck> {
  if (file.size <= 0 || file.size > ATTACHMENT_MAX_BYTES) return { ok: false, reason: "size" }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  const mimeType = file.type.split(";")[0].trim().toLowerCase()
  const allowedExtensions = ATTACHMENT_MIME_TYPES[mimeType]
  if (!allowedExtensions || !allowedExtensions.includes(extension))
    return { ok: false, reason: "type" }

  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer())
  if (!matchesSignature(mimeType, head)) return { ok: false, reason: "type" }
  return { ok: true, mimeType, extension }
}
