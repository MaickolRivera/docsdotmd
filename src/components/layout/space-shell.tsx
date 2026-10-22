import type { ReactNode } from "react"

import { MobileSidebar } from "./mobile-sidebar"
import { PageSidebar, type PageSidebarProps } from "./page-sidebar"

/** Sidebar de páginas del espacio (260 px; en móvil, panel lateral) + contenido. */
export function SpaceShell({
  sidebar,
  children,
}: {
  sidebar: Omit<PageSidebarProps, "onNavigate">
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1">
      <aside className="sticky top-(--header-height) hidden h-[calc(100dvh-var(--header-height))] w-[260px] shrink-0 border-r lg:block">
        <PageSidebar {...sidebar} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileSidebar {...sidebar} />
        {children}
      </div>
    </div>
  )
}
