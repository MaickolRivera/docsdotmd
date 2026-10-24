"use client"

import type { ReactNode } from "react"

import { NewOrgForm } from "@/components/orgs/new-org-form"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * Crear organización en un popover junto al botón. Sin `open` se abre desde el
 * propio `children` (que actúa de botón); con `open`/`onOpenChange` lo controla
 * quien lo usa (por ejemplo, desde un ítem de menú) y `children` solo es el
 * elemento junto al que aparece.
 */
export function NewOrgPopover({
  children,
  open,
  onOpenChange,
  align = "end",
}: {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
}) {
  const Anchor = open === undefined ? PopoverTrigger : PopoverAnchor
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Anchor asChild>{children}</Anchor>
      <PopoverContent align={align} className="w-80">
        <NewOrgForm />
      </PopoverContent>
    </Popover>
  )
}
