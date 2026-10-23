"use client"

import { ChevronRight } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/i18n"
import { DEMO_LINK_PREFIX, type DemoPage, type DemoSpace } from "@/lib/landing-demo"
import type { TocItem } from "@/lib/markdown/toc"
import { cn } from "@/lib/utils"

export type ProductDemoSpace = Omit<DemoSpace, "icon"> & { icon: ReactNode }

export type ProductDemoPage = Omit<DemoPage, "source"> & {
  toc: TocItem[]
  content: ReactNode
}

export function ProductDemo({
  spaces,
  pages,
}: {
  spaces: ProductDemoSpace[]
  pages: ProductDemoPage[]
}) {
  const [pageId, setPageId] = useState(pages[0].id)
  const [activeHeading, setActiveHeading] = useState<string>()
  const contentRef = useRef<HTMLDivElement>(null)

  const page = pages.find((item) => item.id === pageId) ?? pages[0]
  const space = spaces.find((item) => item.id === page.spaceId) ?? spaces[0]
  const spacePages = pages.filter((item) => item.spaceId === space.id)
  const topLevel = spacePages.filter((item) => !item.parentId)
  const currentHeading = activeHeading ?? page.toc[0]?.id
  const path = [page.spaceId, page.parentId, page.id].filter(Boolean).join("/")

  function open(id: string) {
    if (!pages.some((item) => item.id === id)) return
    setPageId(id)
    setActiveHeading(undefined)
    contentRef.current?.scrollTo({ top: 0 })
  }

  function openSpace(id: string) {
    const first = pages.find((item) => item.spaceId === id)
    if (first) open(first.id)
  }

  function findHeading(id: string) {
    const article = contentRef.current?.querySelector(`[data-demo-page="${page.id}"]`)
    return Array.from(article?.querySelectorAll<HTMLElement>("[id]") ?? []).find(
      (element) => element.id === id,
    )
  }

  // Los enlaces "#demo-<id>" del contenido (tarjetas) abren otra página de la demo.
  function onContentClick(event: React.MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as Element).closest(`a[href^="${DEMO_LINK_PREFIX}"]`)
    if (!anchor) return
    event.preventDefault()
    open(anchor.getAttribute("href")!.slice(DEMO_LINK_PREFIX.length))
  }

  // Índice "En esta página": el título activo es el último que pasó el borde superior.
  function onContentScroll() {
    const container = contentRef.current
    if (!container) return
    const top = container.getBoundingClientRect().top
    let current = page.toc[0]?.id
    for (const item of page.toc) {
      const heading = findHeading(item.id)
      if (heading && heading.getBoundingClientRect().top - top <= 32) current = item.id
    }
    // Al final del contenido se marca el último título aunque no llegue arriba.
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 2
    setActiveHeading(atBottom ? page.toc.at(-1)?.id : current)
  }

  function scrollToHeading(id: string) {
    const container = contentRef.current
    const heading = findHeading(id)
    if (!container || !heading) return
    const offset = heading.getBoundingClientRect().top - container.getBoundingClientRect().top
    container.scrollTo({ top: container.scrollTop + offset - 24, behavior: "smooth" })
    setActiveHeading(id)
  }

  function pageItem(item: ProductDemoPage, hasChildren: boolean) {
    const active = item.id === page.id
    return (
      <button
        type="button"
        onClick={() => open(item.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-1 rounded-md pr-1 text-left text-xs pt-1 transition-colors cursor-pointer",
          active
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center">
          {hasChildren ? <ChevronRight className="size-3.5 rotate-90" /> : null}
        </span>
        <span className="truncate py-1.5">{item.title}</span>
        {item.draft ? (
          <Badge variant="outline" className="h-4 shrink-0 px-1.5 text-[10px] font-normal">
            {t.common.draft}
          </Badge>
        ) : null}
      </button>
    )
  }

  return (
    <div className="rounded-2xl border bg-card/60 p-2 pt-0 shadow-2xl shadow-primary/5 backdrop-blur w-full">
      <div aria-hidden className="flex items-center gap-1.5 px-2 py-3">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 truncate text-xs text-muted-foreground">
          docsdotmd.vercel.app/acme/{path}
        </span>
      </div>
      <div className="flex h-130 flex-col overflow-hidden rounded-xl border bg-background text-left shadow-sm md:h-160">

        {/* Pestañas de espacios */}
        <div className="flex min-w-0 scrollbar-none items-center gap-5 border-b px-4 h-10">
          {spaces.map((item) => {
            const selected = item.id === space.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openSpace(item.id)}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "relative flex h-10 shrink-0 items-center gap-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  selected
                    ? "text-primary after:bg-primary"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </button>
            )
          })}
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Barra lateral */}
          <nav
            aria-label={t.landing.demo.pages}
            className="hidden w-52 shrink-0 overflow-y-auto border-r px-3 py-5 md:block"
          >
            <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-foreground uppercase">
              {space.name}
            </p>
            <ul className="flex flex-col gap-1">
              {topLevel.map((item) => {
                const children = spacePages.filter((child) => child.parentId === item.id)
                return (
                  <li key={item.id}>
                    {pageItem(item, children.length > 0)}
                    {children.length ? (
                      <ul className="ml-3 mt-1 flex flex-col gap-1 border-l pl-1">
                        {children.map((child) => (
                          <li key={child.id}>{pageItem(child, false)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* En móvil, las páginas del espacio como fichas */}
            <div className="flex shrink-0 scrollbar-none gap-1.5 overflow-x-auto border-b px-3 py-2 md:hidden">
              {spacePages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => open(item.id)}
                  aria-current={item.id === page.id ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    item.id === page.id
                      ? "border-primary/30 bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div
              ref={contentRef}
              onClickCapture={onContentClick}
              onScroll={onContentScroll}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {pages.map((item) => (
                <article
                  key={item.id}
                  data-demo-page={item.id}
                  hidden={item.id !== page.id}
                  className="mx-auto max-w-170 px-5 pt-7 pb-12 sm:px-8"
                >
                  <p className="mb-3 text-[13px] font-medium text-primary">
                    {spaces.find((entry) => entry.id === item.spaceId)?.name}
                  </p>
                  {item.draft ? (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{t.common.draft}</Badge>
                      {t.reader.draftNotice}
                    </div>
                  ) : null}
                  <p className="mb-5 text-2xl font-semibold tracking-tight">{item.title}</p>
                  {item.content}
                </article>
              ))}
            </div>
          </div>

          {/* En esta página */}
          <aside className="hidden w-48 shrink-0 overflow-y-auto py-7 px-4 xl:block">
            {page.toc.length ? (
              <nav aria-label={t.reader.onThisPage} className="text-xs">
                <p className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
                  {t.reader.onThisPage}
                </p>
                <ul className="flex flex-col gap-1.5 border-l">
                  {page.toc.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToHeading(item.id)}
                        className={cn(
                          "-ml-px block border-l py-0.5 text-left leading-5 transition-colors",
                          item.depth === 3 ? "pl-5" : "pl-3",
                          item.id === currentHeading
                            ? "border-primary font-medium text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
