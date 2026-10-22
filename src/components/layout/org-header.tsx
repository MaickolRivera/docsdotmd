import Link from "next/link"

import { LogoMark } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

import { SearchDialog } from "./search-dialog"
import { SpaceTabs, type SpaceTab } from "./space-tabs"
import { UserMenu, type UserMenuOrg } from "./user-menu"

/**
 * Header fijo: logo y nombre de la organización, buscador centrado (Ctrl+K),
 * tema y avatar. Debajo, las pestañas de espacios.
 */
export function OrgHeader({
  org,
  spaces,
  orgs,
  user,
  isAdmin,
}: {
  org: { id: string; name: string; slug: string }
  spaces: SpaceTab[]
  orgs: UserMenuOrg[]
  user: { name: string; email: string }
  isAdmin: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 lg:px-6">
        <Link href={`/${org.slug}`} className="flex min-w-0 shrink-0 items-center gap-2.5 md:w-60">
          <LogoMark />
          <span className="truncate font-semibold tracking-tight">{org.name}</span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-end md:justify-center">
          <SearchDialog orgId={org.id} orgSlug={org.slug} />
        </div>
        <div className="flex shrink-0 items-center gap-1 md:w-60 md:justify-end">
          <ThemeToggle />
          <UserMenu
            name={user.name}
            email={user.email}
            orgs={orgs}
            currentOrgSlug={org.slug}
            settingsHref={isAdmin ? `/${org.slug}/ajustes` : undefined}
          />
        </div>
      </div>
      <SpaceTabs orgSlug={org.slug} spaces={spaces} showSettings={isAdmin} />
    </header>
  )
}
