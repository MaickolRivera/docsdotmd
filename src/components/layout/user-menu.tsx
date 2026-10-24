"use client"

import { BookOpen, Building2, Check, LogOut, Plus, Settings } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"

import { signOut } from "@/actions/auth"
import { NewOrgPopover } from "@/components/orgs/new-org-popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/lib/constants"
import { initials } from "@/lib/format"
import { t } from "@/lib/i18n"

export type UserMenuOrg = { name: string; slug: string; role: Role }

/** Avatar con: cambiar de organización, ajustes, guía, tema y cerrar sesión. */
export function UserMenu({
  name,
  email,
  orgs,
  currentOrgSlug,
  settingsHref,
}: {
  name: string
  email: string
  orgs: UserMenuOrg[]
  currentOrgSlug?: string
  settingsHref?: string
}) {
  const { theme, setTheme } = useTheme()
  const [newOrgOpen, setNewOrgOpen] = useState(false)

  return (
    <NewOrgPopover open={newOrgOpen} onOpenChange={setNewOrgOpen}>
      <span className="inline-flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={t.header.userMenu}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 pt-1 text-xs font-semibold text-primary">
                  {initials(name || email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            // Si se abrió "Nueva organización", el foco va al popover, no al avatar.
            onCloseAutoFocus={(event) => {
              if (newOrgOpen) event.preventDefault()
            }}
          >
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">{name || email}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {t.header.organizations}
              </DropdownMenuLabel>
              {orgs.slice(0, 8).map((org) => (
                <DropdownMenuItem key={org.slug} asChild>
                  <Link href={`/${org.slug}`}>
                    <Building2 />
                    <span className="flex-1 truncate">{org.name}</span>
                    {org.slug === currentOrgSlug ? <Check className="text-primary" /> : null}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/orgs">{t.header.allOrganizations}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setNewOrgOpen(true)}>
                <Plus />
                {t.header.newOrganization}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {settingsHref ? (
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>
                  <Settings />
                  {t.header.settings}
                </Link>
              </DropdownMenuItem>
            ) : null}
            {/* En otra pestaña, para no perder lo que se esté editando. */}
            <DropdownMenuItem asChild>
              <Link href="/guia" target="_blank" rel="noopener">
                <BookOpen />
                {t.guide.title}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t.header.theme}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">{t.header.themeLight}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">{t.header.themeDark}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    {t.header.themeSystem}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                void signOut()
              }}
            >
              <LogOut />
              {t.auth.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </NewOrgPopover>
  )
}
