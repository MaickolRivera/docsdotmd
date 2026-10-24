import Link from "next/link"

import { UserMenu } from "@/components/layout/user-menu"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { getProfile, getUserOrgs } from "@/lib/data"
import { t } from "@/lib/i18n"

export default async function OrgsLayout({ children }: LayoutProps<"/orgs">) {
  const [profile, orgs] = await Promise.all([getProfile(), getUserOrgs()])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center gap-4 px-4 md:justify-between">
          <Link href="/" aria-label={t.common.appName}>
            <Logo />
          </Link>
          <div className="flex items-center gap-1 pb-2.5">
            <ThemeToggle />
            <UserMenu
              name={profile?.full_name ?? ""}
              email={profile?.email ?? ""}
              orgs={orgs.map(({ name, slug, role }) => ({ name, slug, role }))}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  )
}
