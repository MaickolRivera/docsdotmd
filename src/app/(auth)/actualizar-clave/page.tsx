import { CircleAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/forms/auth-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { t } from "@/lib/i18n"

import { UpdatePasswordForm } from "./update-password-form"

export const metadata: Metadata = { title: t.auth.updatePassword.title }

// Se llega aquí desde el enlace del correo de recuperación (/auth/callback ya
// creó la sesión). Sin sesión, el enlace no era válido o expiró.
export default async function UpdatePasswordPage() {
  const user = await getCurrentUser()

  return (
    <AuthCard title={t.auth.updatePassword.title} description={t.auth.updatePassword.description}>
      {user ? (
        <UpdatePasswordForm />
      ) : (
        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{t.auth.updatePassword.invalidSession}</AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/recuperar">{t.auth.updatePassword.requestNew}</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  )
}
