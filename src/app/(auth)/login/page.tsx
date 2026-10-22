import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/forms/auth-card"
import { t } from "@/lib/i18n"
import { safeRedirectPath } from "@/lib/redirect"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: t.auth.login.title }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams
  const next = typeof params.next === "string" ? safeRedirectPath(params.next) : undefined
  const linkError = params.error ? t.auth.login.linkError : undefined
  const registerHref = next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"

  return (
    <AuthCard
      title={t.auth.login.title}
      description={t.auth.login.description}
      footer={
        <span>
          {t.auth.login.noAccount}{" "}
          <Link href={registerHref} className="font-medium text-primary hover:underline">
            {t.auth.login.register}
          </Link>
        </span>
      }
    >
      <LoginForm next={next} initialError={linkError} />
    </AuthCard>
  )
}
