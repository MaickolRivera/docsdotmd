import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/redirect"
import { createClient } from "@/lib/supabase/server"

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]

/**
 * Destino de los enlaces de los correos (confirmar cuenta, recuperar
 * contraseña). Acepta los dos formatos de Supabase:
 *   - ?code=...                    (PKCE, mismo navegador)
 *   - ?token_hash=...&type=...     (plantillas de correo de supabase/templates)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeRedirectPath(searchParams.get("next"))
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  const supabase = await createClient()
  let verified = false

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    verified = !error
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    verified = !error
  }

  if (!verified) return NextResponse.redirect(new URL("/login?error=enlace", origin))
  return NextResponse.redirect(new URL(next, origin))
}
