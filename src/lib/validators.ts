import { z } from "zod"

import { t } from "@/lib/i18n"

// Esquemas Zod compartidos por los formularios (react-hook-form) y las
// Server Actions, que vuelven a validar todo lo que reciben.

const v = t.validation

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: v.email }).max(254, { error: v.email }))

const newPasswordSchema = z
  .string()
  .min(8, { error: v.passwordMin(8) })
  .max(72, { error: v.passwordMax })

function textSchema(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, { error: min === 1 ? v.required : v.nameLength(min, max) })
    .max(max, { error: v.nameLength(min, max) })
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: v.required }).max(200),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: textSchema(2, 120),
  email: emailSchema,
  password: newPasswordSchema,
})
export type RegisterInput = z.infer<typeof registerSchema>

export const recoverSchema = z.object({ email: emailSchema })
export type RecoverInput = z.infer<typeof recoverSchema>

export const updatePasswordSchema = z
  .object({ password: newPasswordSchema, confirm: z.string() })
  .refine((data) => data.password === data.confirm, {
    error: v.passwordsMismatch,
    path: ["confirm"],
  })
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
