import { notFound } from "next/navigation"

import {
  DeleteOrgSection,
  LeaveOrgSection,
  OrgGeneralForm,
  TransferOwnershipSection,
} from "@/components/settings/general-settings"
import { SettingsSection } from "@/components/settings/section"
import { getOrgContext, getOrgMembers } from "@/lib/data"
import { t } from "@/lib/i18n"

export default async function GeneralSettingsPage({ params }: PageProps<"/[org]/ajustes">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()
  const isOwner = context.role === "owner"
  const members = isOwner ? await getOrgMembers(context.org.id) : []
  const owners = members.filter((member) => member.role === "owner")

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title={t.settings.general.title}
        description={isOwner ? t.settings.general.description : t.settings.general.onlyOwner}
      >
        <OrgGeneralForm
          orgId={context.org.id}
          name={context.org.name}
          slug={context.org.slug}
          editable={isOwner}
        />
      </SettingsSection>

      {isOwner ? (
        <SettingsSection
          title={t.settings.general.transferTitle}
          description={t.settings.general.transferDescription}
        >
          <TransferOwnershipSection
            orgId={context.org.id}
            candidates={members
              .filter((member) => member.userId !== context.userId)
              .map((member) => ({ id: member.userId, name: member.fullName || member.email }))}
          />
        </SettingsSection>
      ) : null}

      <SettingsSection
        title={t.settings.general.leaveTitle}
        description={t.settings.general.leaveDescription}
      >
        <LeaveOrgSection orgId={context.org.id} isLastOwner={isOwner && owners.length <= 1} />
      </SettingsSection>

      {isOwner ? (
        <SettingsSection
          danger
          title={t.settings.general.deleteTitle}
          description={t.settings.general.deleteDescription}
        >
          <DeleteOrgSection orgId={context.org.id} slug={context.org.slug} />
        </SettingsSection>
      ) : null}
    </div>
  )
}
