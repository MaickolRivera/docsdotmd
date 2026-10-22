import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/forms/auth-card"
import { t } from "@/lib/i18n"

import { RecoverForm } from "./recover-form"

export const metadata: Metadata = { title: t.auth.recover.title }

export default function RecoverPage() {
  return (
    <AuthCard
      title={t.auth.recover.title}
      description={t.auth.recover.description}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t.auth.recover.backToLogin}
        </Link>
      }
    >
      <RecoverForm />
    </AuthCard>
  )
}
