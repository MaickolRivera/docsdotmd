import { ArrowRight, Building2, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { NewOrgDialog } from "@/components/orgs/new-org-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getUserOrgs } from "@/lib/data"
import { t } from "@/lib/i18n"

export const metadata: Metadata = { title: t.orgs.title }

export default async function OrgsPage() {
  const orgs = await getUserOrgs()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.orgs.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.orgs.description}</p>
        </div>
        <NewOrgDialog>
          <Button>
            <Plus data-icon="inline-start" />
            {t.orgs.new}
          </Button>
        </NewOrgDialog>
      </div>

      {orgs.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t.orgs.emptyTitle}</EmptyTitle>
            <EmptyDescription>{t.orgs.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewOrgDialog>
              <Button>{t.orgs.new}</Button>
            </NewOrgDialog>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <li key={org.id}>
              <Link
                href={`/${org.slug}`}
                className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
                    {org.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{org.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      /{org.slug}
                    </span>
                  </span>
                </span>
                <span className="mt-auto flex items-center justify-between">
                  <Badge variant="secondary">{t.roles[org.role]}</Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                    {t.orgs.open}
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
