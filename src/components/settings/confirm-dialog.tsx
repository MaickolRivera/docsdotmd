"use client"

import { useState, useTransition, type ReactElement, type ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { t } from "@/lib/i18n"

/**
 * Confirmación antes de una acción destructiva. `onConfirm` devuelve false si
 * falló, para dejar el diálogo abierto.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = t.common.delete,
  destructive = true,
  confirmDisabled,
  onConfirm,
  children,
}: {
  trigger: ReactElement
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
  confirmDisabled?: boolean
  onConfirm: () => Promise<boolean | void>
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog open={open} onOpenChange={(value) => !pending && setOpen(value)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={pending || confirmDisabled}
            onClick={(event) => {
              event.preventDefault()
              startTransition(async () => {
                const result = await onConfirm()
                if (result !== false) setOpen(false)
              })
            }}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
