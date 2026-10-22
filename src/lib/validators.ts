import { z } from "zod"

import {
  PAGE_CONTENT_MAX_LENGTH,
  PAGE_STATUSES,
  RESERVED_ORG_SLUGS,
  RESERVED_PAGE_SLUGS,
  RESERVED_SPACE_SLUGS,
  ROLES,
  SPACE_PERMISSIONS,
  SPACE_VISIBILITIES,
} from "@/lib/constants"
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

// ---------------------------------------------------------------------------
// Espacios
// ---------------------------------------------------------------------------
export const spaceFormSchema = z.object({
  name: textSchema(1, 60),
  slug: slugSchema(1, 48, RESERVED_SPACE_SLUGS),
  icon: z.string().regex(/^[a-z0-9-]{1,40}$/),
  visibility: z.enum(SPACE_VISIBILITIES),
  groups: z.array(z.object({ groupId: idSchema, permission: z.enum(SPACE_PERMISSIONS) })).max(100),
})
export type SpaceFormInput = z.infer<typeof spaceFormSchema>

export const saveSpaceSchema = spaceFormSchema.extend({
  orgId: idSchema,
  spaceId: idSchema.optional(),
})

export const spaceIdSchema = z.object({ orgId: idSchema, spaceId: idSchema })

export const moveSchema = z.object({ direction: z.enum(["up", "down"]) })

// ---------------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------------
export const pageFormSchema = z.object({
  title: textSchema(1, 160),
  slug: slugSchema(1, 80, RESERVED_PAGE_SLUGS),
  parentId: idSchema.nullable(),
  status: z.enum(PAGE_STATUSES),
  content: z
    .string()
    .max(PAGE_CONTENT_MAX_LENGTH, { error: v.contentTooLong(PAGE_CONTENT_MAX_LENGTH) }),
})
export type PageFormInput = z.infer<typeof pageFormSchema>

export const savePageSchema = pageFormSchema.extend({ pageId: idSchema })

export const createPageSchema = z.object({
  spaceId: idSchema,
  parentId: idSchema.nullable(),
})

export const pageIdSchema = z.object({ pageId: idSchema })

export const attachmentIdSchema = z.object({ attachmentId: idSchema })
