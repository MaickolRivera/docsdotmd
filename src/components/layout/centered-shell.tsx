import Link from "next/link"
import type { ReactNode } from "react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { t } from "@/lib/i18n"

/** Marco centrado para formularios de acceso e invitaciones. */
export function CenteredShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-2xl rounded-full bg-primary/15 blur-3xl"
      />
      <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label={t.common.appName}>
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-10 pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
