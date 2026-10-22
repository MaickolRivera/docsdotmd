"use client"

import { SquarePen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { t } from "@/lib/i18n"
import type { TocItem } from "@/lib/markdown/toc"
import { cn } from "@/lib/utils"

/** Alto del header fijo más un margen, en px. */
const HEADER_OFFSET = 140

/** "En esta página": títulos h2/h3 con el activo resaltado al hacer scroll. */
export function Toc({ items, editHref }: { items: TocItem[]; editHref?: string }) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null)
    if (!headings.length) return

    // Activo = el último título que ya pasó por debajo del header fijo.
    let frame = 0
    const update = () => {
      frame = 0
      let current = headings[0].id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - HEADER_OFFSET > 0) break
        current = heading.id
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActiveId(atBottom ? headings[headings.length - 1].id : current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [items])

  if (!items.length && !editHref) return null

  return (
    <nav aria-label={t.reader.onThisPage} className="flex flex-col gap-6 text-sm">
      {items.length ? (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
            {t.reader.onThisPage}
          </p>
          <ul className="flex flex-col gap-1.5 border-l">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={item.id === activeId ? "location" : undefined}
                  className={cn(
                    "-ml-px block border-l py-0.5 leading-5 transition-colors",
                    item.depth === 3 ? "pl-6" : "pl-3",
                    item.id === activeId
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {editHref ? (
        <Link
          href={editHref}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <SquarePen className="size-4" />
          {t.reader.editPage}
        </Link>
      ) : null}
    </nav>
  )
}
