"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { t } from "@/lib/i18n"

import { PageSidebar, type PageSidebarProps } from "./page-sidebar"

/** En pantallas pequeñas el sidebar va en un panel lateral. */
export function MobileSidebar(props: Omit<PageSidebarProps, "onNavigate">) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sticky top-(--header-height) z-30 flex h-11 items-center border-b bg-background/90 px-2 backdrop-blur lg:hidden">
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Menu data-icon="inline-start" />
        {t.sidebar.mobileTrigger}
      </Button>
      <span className="truncate text-sm text-muted-foreground">· {props.spaceName}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[290px] gap-0 p-0">
          <SheetTitle className="sr-only">{t.sidebar.label}</SheetTitle>
          <SheetDescription className="sr-only">{props.spaceName}</SheetDescription>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3 z-10">
              <X />
              <span className="sr-only">{t.common.close}</span>
            </Button>
          </SheetClose>
          <PageSidebar {...props} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
