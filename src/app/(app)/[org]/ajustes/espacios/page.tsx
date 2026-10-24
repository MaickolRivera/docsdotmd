import { notFound } from "next/navigation"

import { SettingsSection } from "@/components/settings/section"
import { SpacesTable } from "@/components/settings/spaces-settings"
import { getGroups, getOrgContext, getSpacesWithAccess } from "@/lib/data"
import { t } from "@/lib/i18n"

export default async function SpacesSettingsPage({ params }: PageProps<"/[org]/ajustes/espacios">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()

  const [spaces, groups] = await Promise.all([
    getSpacesWithAccess(context.org.id),
    getGroups(context.org.id),
  ])
  const groupOptions = groups.map(({ id, name }) => ({ id, name }))

  return (
    <SettingsSection title={t.settings.spaces.title} description={t.settings.spaces.description}>
      <SpacesTable orgId={context.org.id} orgSlug={orgSlug} spaces={spaces} groups={groupOptions} />
    </SettingsSection>
  )
}
