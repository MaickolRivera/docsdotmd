"use client"

import { Children, isValidElement, useId, useState, type ReactNode } from "react"

import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { CopyButton } from "./copy-button"

/**
 * `::::code-tabs` — tarjeta oscura con pestañas arriba (JavaScript, Python,
 * cURL…), un solo bloque visible y botón de copiar.
 */
export function CodeTabs({ titles, children }: { titles: string[]; children?: ReactNode }) {
  const panels = Children.toArray(children).filter(isValidElement)
  const [active, setActive] = useState(0)
  const id = useId()
  const current = Math.min(active, panels.length - 1)

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const delta = event.key === "ArrowRight" ? 1 : -1
    const next = (current + delta + panels.length) % panels.length
    setActive(next)
    event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus()
  }

  return (
    <div
      data-code-block=""
      className="docs-code not-prose my-6 overflow-hidden rounded-xl border border-code-border bg-code text-zinc-100 shadow-sm"
    >
      <div className="flex h-10 items-center gap-2 border-b border-white/10 pr-2 pl-2">
        <div
          role="tablist"
          aria-label={t.docs.codeTabs}
          onKeyDown={onKeyDown}
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          {panels.map((_, index) => {
            const selected = index === current
            return (
              <button
                key={index}
                id={`${id}-tab-${index}`}
                type="button"
                role="tab"
                aria-controls={`${id}-panel-${index}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                className={cn(
                  "relative h-10 shrink-0 px-2.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "text-white after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {titles[index] ?? `${index + 1}`}
              </button>
            )
          })}
        </div>
        <CopyButton />
      </div>
      {panels.map((panel, index) => (
        <div
          key={index}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== current}
        >
          {panel}
        </div>
      ))}
    </div>
  )
}
