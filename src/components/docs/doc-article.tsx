import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import Link from "next/link"

import { Toc } from "@/components/layout/toc"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PageStatus } from "@/lib/constants"
import { t } from "@/lib/i18n"
import { DocsMarkdown } from "@/lib/markdown/render"
import type { TocItem } from "@/lib/markdown/toc"

type NavLink = { title: string; href: string }

/**
 * Lector de una página: ruta, contenido (ancho máximo ~720 px), anterior y
 * siguiente, y la columna "En esta página".
 */
export function DocArticle({
  pageId,
  spaceName,
  ancestors,
  title,
  status,
  content,
  updatedLabel,
  toc,
  editHref,
  prev,
  next,
}: {
  pageId: string
  spaceName: string
  ancestors: NavLink[]
  title: string
  status: PageStatus
  content: string
  updatedLabel: string
  toc: TocItem[]
  editHref?: string
  prev: NavLink | null
  next: NavLink | null
}) {
  // Si el markdown ya empieza con "# Título", no se repite el título.
  const startsWithTitle = /^\s*#\s/.test(content)

  return (
    <div className="flex flex-1">
      <article className="min-w-0 flex-1 px-4 pt-8 pb-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[720px]">
          <nav
            aria-label={t.reader.breadcrumb}
            className="mb-4 flex flex-wrap items-center gap-1 text-sm text-primary"
          >
            <span className="font-medium">{spaceName}</span>
            {ancestors.map((ancestor) => (
              <span key={ancestor.href} className="flex items-center gap-1">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <Link href={ancestor.href} className="hover:underline">
                  {ancestor.title}
                </Link>
              </span>
            ))}
          </nav>

          {status === "draft" ? (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{t.common.draft}</Badge>
              {t.reader.draftNotice}
            </div>
          ) : null}

          {startsWithTitle ? null : (
            <h1 className="mb-6 text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          )}

          <DocsMarkdown source={content} />

          <footer className="mt-12 flex flex-col gap-6 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{updatedLabel}</span>
              {editHref ? (
                <Button asChild variant="ghost" size="sm" className="xl:hidden">
                  <Link href={editHref}>
                    <Pencil data-icon="inline-start" />
                    {t.reader.editPage}
                  </Link>
                </Button>
              ) : null}
            </div>
            {prev || next ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={prev.href}
                    className="group flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-primary/50"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronLeft className="size-3.5" />
                      {t.reader.previous}
                    </span>
                    <span className="font-medium group-hover:text-primary">{prev.title}</span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <Link
                    href={next.href}
                    className="group flex flex-col items-end gap-1 rounded-xl border p-4 text-right transition-colors hover:border-primary/50"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {t.reader.next}
                      <ChevronRight className="size-3.5" />
                    </span>
                    <span className="font-medium group-hover:text-primary">{next.title}</span>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </footer>
        </div>
      </article>

      <aside className="sticky top-(--header-height) hidden h-[calc(100dvh-var(--header-height))] w-64 shrink-0 overflow-y-auto py-8 pr-6 pl-2 xl:block">
        <Toc key={pageId} items={toc} editHref={editHref} />
      </aside>
    </div>
  )
}
