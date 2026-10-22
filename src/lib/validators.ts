import { z } from "zod"

import { RESERVED_ORG_SLUGS, ROLES } from "@/lib/constants"
import { t } from "@/lib/i18n"
import { SLUG_PATTERN } from "@/lib/slug"

// Esquemas Zod compartidos por los formularios (react-hook-form) y las
// Server Actions, que vuelven a validar todo lo que reciben.

const v = t.validation

export const idSchema = z.guid({ error: v.invalidId })

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: v.email }).max(254, { error: v.email }))

const newPasswordSchema = z
  .string()
  .min(8, { error: v.passwordMin(8) })
  .max(72, { error: v.passwordMax })

function slugSchema(min: number, max: number, reserved: readonly string[]) {
  return z
    .string()
    .trim()
    .min(min, { error: min > 1 ? v.nameLength(min, max) : v.required })
    .max(max, { error: v.nameLength(min, max) })
    .regex(SLUG_PATTERN, { error: v.slugFormat })
    .refine((slug) => !reserved.includes(slug), { error: v.slugReserved })
}

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

// ---------------------------------------------------------------------------
// Organizaciones, miembros y grupos
// ---------------------------------------------------------------------------
export const orgFormSchema = z.object({
  name: textSchema(2, 80),
  slug: slugSchema(2, 48, RESERVED_ORG_SLUGS),
})
export type OrgFormInput = z.infer<typeof orgFormSchema>

export const updateOrgSchema = orgFormSchema.extend({ orgId: idSchema })

export const inviteFormSchema = z.object({
  email: emailSchema,
  role: z.enum(ROLES),
})
export type InviteFormInput = z.infer<typeof inviteFormSchema>

export const inviteSchema = inviteFormSchema.extend({ orgId: idSchema })

export const changeRoleSchema = z.object({
  orgId: idSchema,
  userId: idSchema,
  role: z.enum(ROLES),
})

export const memberSchema = z.object({ orgId: idSchema, userId: idSchema })

export const invitationIdSchema = z.object({ orgId: idSchema, invitationId: idSchema })

export const invitationTokenSchema = z.object({
  token: z
    .string()
    .min(20)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/),
})

export const deleteOrgSchema = z.object({ orgId: idSchema, confirmSlug: z.string().trim() })

export const groupFormSchema = z.object({ name: textSchema(1, 60) })
export type GroupFormInput = z.infer<typeof groupFormSchema>

export const createGroupSchema = groupFormSchema.extend({ orgId: idSchema })
export const renameGroupSchema = groupFormSchema.extend({ orgId: idSchema, groupId: idSchema })
export const groupIdSchema = z.object({ orgId: idSchema, groupId: idSchema })
export const groupMemberSchema = z.object({
  orgId: idSchema,
  groupId: idSchema,
  userId: idSchema,
})
