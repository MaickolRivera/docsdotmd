import { notFound } from "next/navigation"

import { InviteDialog, InvitationsList, MembersTable } from "@/components/settings/members-settings"
import { SettingsSection } from "@/components/settings/section"
import { getOrgContext, getOrgMembers, getPendingInvitations } from "@/lib/data"
import { t } from "@/lib/i18n"

export default async function MembersSettingsPage({
  params,
}: PageProps<"/[org]/ajustes/miembros">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()

  const [members, invitations] = await Promise.all([
    getOrgMembers(context.org.id),
    getPendingInvitations(context.org.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title={t.settings.members.title}
        description={t.settings.members.description}
        action={<InviteDialog orgId={context.org.id} canInviteOwners={context.role === "owner"} />}
      >
        <MembersTable
          orgId={context.org.id}
          members={members}
          currentUserId={context.userId}
          currentRole={context.role}
        />
      </SettingsSection>
      <SettingsSection title={t.settings.members.pending}>
        <InvitationsList orgId={context.org.id} invitations={invitations} />
      </SettingsSection>
    </div>
  )
}
