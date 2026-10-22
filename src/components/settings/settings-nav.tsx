"use client"

import { Building2, LayoutGrid, Users, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function SettingsNav({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname()
  const base = `/${orgSlug}/ajustes`
  const items = [
    { href: base, label: t.settings.nav.general, icon: Building2 },
    { href: `${base}/miembros`, label: t.settings.nav.members, icon: Users },
    { href: `${base}/grupos`, label: t.settings.nav.groups, icon: UsersRound },
    { href: `${base}/espacios`, label: t.settings.nav.spaces, icon: LayoutGrid },
  ]

  return (
    <nav aria-label={t.settings.title} className="md:w-48 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
