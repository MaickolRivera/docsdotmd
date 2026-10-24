"use client"

import { Settings } from "lucide-react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import type { ReactNode } from "react"

import { t } from "@/lib/i18n"
import { DocIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type SpaceTab = { id: string; name: string; slug: string; icon: string }

/** Pestañas de espacios: icono + nombre; la activa en el color primario con línea inferior. */
export function SpaceTabs({
  orgSlug,
  spaces,
  showSettings,
  newSpace,
}: {
  orgSlug: string
  spaces: SpaceTab[]
  showSettings: boolean
  /** Botón para crear un espacio (solo admins); va justo después de la última pestaña. */
  newSpace?: ReactNode
}) {
  const active = useSelectedLayoutSegment()

  const tabClass = (selected: boolean) =>
    cn(
      "relative flex h-11 shrink-0 items-center gap-2 px-1 text-sm font-medium whitespace-nowrap transition-colors",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
      selected
        ? "text-primary after:bg-primary"
        : "text-muted-foreground hover:text-foreground after:bg-transparent",
    )

  return (
    <nav
      aria-label={t.header.spaces}
      className="mx-auto flex max-w-360 items-center gap-6 px-4 lg:px-6"
    >
      <div className="-mb-px flex min-w-0 flex-1 scrollbar-none items-center gap-6 overflow-x-auto">
        {spaces.map((space) => {
          const selected = active === space.slug
          return (
            <Link
              key={space.id}
              href={`/${orgSlug}/${space.slug}`}
              aria-current={selected ? "page" : undefined}
              className={tabClass(selected)}
            >
              <DocIcon name={space.icon} />
              {space.name}
            </Link>
          )
        })}
        {newSpace}
      </div>
      {showSettings ? (
        <Link
          href={`/${orgSlug}/ajustes`}
          aria-current={active === "ajustes" ? "page" : undefined}
          className={tabClass(active === "ajustes")}
        >
          <Settings className="size-4" />
          <span className="hidden sm:inline">{t.header.settings}</span>
        </Link>
      ) : null}
    </nav>
  )
}
