import { notFound } from "next/navigation"

import { CreateGroupDialog, GroupCard } from "@/components/settings/groups-settings"
import { SettingsSection } from "@/components/settings/section"
import { getGroups, getOrgContext, getOrgMembers, getSpacesWithAccess } from "@/lib/data"
import { t } from "@/lib/i18n"

export default async function GroupsSettingsPage({ params }: PageProps<"/[org]/ajustes/grupos">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()

  const [groups, members, spaces] = await Promise.all([
    getGroups(context.org.id),
    getOrgMembers(context.org.id),
    getSpacesWithAccess(context.org.id),
  ])
  const memberOptions = members.map((member) => ({
    id: member.userId,
    name: member.fullName || member.email,
    email: member.email,
  }))

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title={t.settings.groups.title}
        description={t.settings.groups.description}
        action={<CreateGroupDialog orgId={context.org.id} />}
      >
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.settings.groups.empty}</p>
        ) : null}
      </SettingsSection>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          orgId={context.org.id}
          group={group}
          members={memberOptions}
          spaces={spaces
            .filter((space) => space.groups.some((access) => access.groupId === group.id))
            .map((space) => ({
              name: space.name,
              permission: space.groups.find((access) => access.groupId === group.id)!.permission,
            }))}
        />
      ))}
    </div>
  )
}
