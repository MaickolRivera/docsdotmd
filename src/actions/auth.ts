"use server"

import { redirect } from "next/navigation"

import { fail, invalid, ok, type ActionResult } from "@/lib/action-result"
import { t } from "@/lib/i18n"
import { safeRedirectPath } from "@/lib/redirect"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, recoverSchema, registerSchema, updatePasswordSchema } from "@/lib/validators"

function isRateLimited(error: { status?: number; code?: string }) {
  return error.status === 429 || error.code?.startsWith("over_") === true
}

export async function signIn(input: unknown, next?: string | null): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (error.code === "email_not_confirmed") return fail(t.auth.login.emailNotConfirmed)
    if (isRateLimited(error)) return fail(t.common.rateLimited)
    if (error.code === "invalid_credentials" || error.status === 400) {
      return fail(t.auth.login.invalidCredentials)
    }
    // Red caída o error del servidor de Auth: no es culpa de la contraseña.
    console.error("[auth] signIn", error.status, error.code, error.message)
    return fail(t.common.genericError)
  }
  redirect(safeRedirectPath(next))
}

export async function signUp(
  input: unknown,
  next?: string | null,
): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const target = safeRedirectPath(next)
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=${encodeURIComponent(target)}`,
    },
  })
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return fail(t.auth.register.emailTaken, { email: t.auth.register.emailTaken })
    }
    if (error.code === "weak_password") {
      return fail(t.auth.register.weakPassword, { password: t.auth.register.weakPassword })
    }
    if (isRateLimited(error)) return fail(t.common.rateLimited)
    console.error("[auth] signUp", error.code, error.message)
    return fail(t.common.genericError)
  }

  // Sin confirmación por correo (configuración local) ya hay sesión.
  if (data.session) redirect(target)
  return ok({ email: parsed.data.email })
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = recoverSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getSiteUrl()}/auth/callback?next=${encodeURIComponent("/actualizar-clave")}`,
  })
  if (error && isRateLimited(error)) return fail(t.common.rateLimited)
  if (error) console.error("[auth] resetPasswordForEmail", error.code, error.message)
  // Siempre la misma respuesta: no se revela si el correo existe.
  return ok()
}

export async function updatePassword(input: unknown): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail(t.auth.updatePassword.invalidSession)

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") {
      return fail(t.auth.register.weakPassword, { password: t.auth.register.weakPassword })
    }
    if (isRateLimited(error)) return fail(t.common.rateLimited)
    console.error("[auth] updateUser", error.code, error.message)
    return fail(t.common.genericError)
  }
  redirect("/orgs")
}

/** Cierra la sesión. Si el formulario trae `next`, vuelve ahí después del login. */
export async function signOut(formData?: FormData): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const next = formData?.get("next")
  redirect(
    typeof next === "string" && next
      ? `/login?next=${encodeURIComponent(safeRedirectPath(next))}`
      : "/login",
  )
}
