import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { OrgHeader } from "@/components/layout/org-header"
import { ADMIN_ROLES, hasRole } from "@/lib/constants"
import { getGroups, getOrgContext, getProfile, getSpaces, getUserOrgs } from "@/lib/data"

export async function generateMetadata({ params }: LayoutProps<"/[org]">): Promise<Metadata> {
  const { org } = await params
  const context = await getOrgContext(org)
  return context
    ? { title: { default: context.org.name, template: `%s · ${context.org.name}` } }
    : {}
}

export default async function OrgLayout({ children, params }: LayoutProps<"/[org]">) {
  const { org: orgSlug } = await params
  // No ser miembro y que la organización no exista responden igual: 404.
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()

  const isAdmin = hasRole(context.role, ADMIN_ROLES)
  const [spaces, orgs, profile, groups] = await Promise.all([
    getSpaces(context.org.id),
    getUserOrgs(),
    getProfile(),
    // Solo los admins crean espacios desde las pestañas.
    isAdmin ? getGroups(context.org.id) : [],
  ])

  return (
    <div className="flex min-h-dvh flex-col">
      <OrgHeader
        org={context.org}
        spaces={spaces.map(({ id, name, slug, icon }) => ({ id, name, slug, icon }))}
        orgs={orgs.map(({ name, slug, role }) => ({ name, slug, role }))}
        user={{ name: profile?.full_name ?? "", email: profile?.email ?? "" }}
        isAdmin={isAdmin}
        groups={groups.map(({ id, name }) => ({ id, name }))}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
