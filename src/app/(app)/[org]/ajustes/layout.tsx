import { notFound } from "next/navigation"

import { SettingsNav } from "@/components/settings/settings-nav"
import { ADMIN_ROLES, hasRole } from "@/lib/constants"
import { getOrgContext } from "@/lib/data"
import { t } from "@/lib/i18n"

export const metadata = { title: t.settings.title }

/** Administración de la organización: solo owner y admin (el resto ve 404). */
export default async function SettingsLayout({ children, params }: LayoutProps<"/[org]/ajustes">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context || !hasRole(context.role, ADMIN_ROLES)) notFound()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <SettingsNav orgSlug={orgSlug} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
