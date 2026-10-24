"use client"

import type { ReactNode } from "react"

import { NewOrgForm } from "@/components/orgs/new-org-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { t } from "@/lib/i18n"

/**
 * Crear organización en una ventana sobre la página actual. Con `children` se
 * abre desde ese botón; con `open`/`onOpenChange` lo controla quien lo usa
 * (por ejemplo, desde un ítem de menú).
 */
export function NewOrgDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.orgs.newPage.title}</DialogTitle>
          <DialogDescription>{t.orgs.newPage.description}</DialogDescription>
        </DialogHeader>
        <NewOrgForm />
      </DialogContent>
    </Dialog>
  )
}
