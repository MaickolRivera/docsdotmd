import { LayoutGrid } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ADMIN_ROLES, hasRole } from "@/lib/constants"
import { getOrgContext, getSpaces } from "@/lib/data"
import { t } from "@/lib/i18n"

/** /[org] lleva al primer espacio visible. */
export default async function OrgHomePage({ params }: PageProps<"/[org]">) {
  const { org: orgSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()

  const spaces = await getSpaces(context.org.id)
  if (spaces[0]) redirect(`/${orgSlug}/${spaces[0].slug}`)

  const isAdmin = hasRole(context.role, ADMIN_ROLES)
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutGrid />
          </EmptyMedia>
          <EmptyTitle>{t.reader.noSpacesTitle}</EmptyTitle>
          <EmptyDescription>
            {isAdmin ? t.reader.noSpacesAdmin : t.reader.noSpacesMember}
          </EmptyDescription>
        </EmptyHeader>
        {isAdmin ? (
          <EmptyContent>
            <Button asChild>
              <Link href={`/${orgSlug}/ajustes/espacios`}>{t.reader.goToSettings}</Link>
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </main>
  )
}
