import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/forms/auth-card"
import { t } from "@/lib/i18n"
import { safeRedirectPath } from "@/lib/redirect"

import { RegisterForm } from "./register-form"

export const metadata: Metadata = { title: t.auth.register.title }

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const params = await searchParams
  const next = typeof params.next === "string" ? safeRedirectPath(params.next) : undefined
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login"

  return (
    <AuthCard
      title={t.auth.register.title}
      description={t.auth.register.description}
      footer={
        <span>
          {t.auth.register.haveAccount}{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            {t.auth.register.login}
          </Link>
        </span>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  )
}
