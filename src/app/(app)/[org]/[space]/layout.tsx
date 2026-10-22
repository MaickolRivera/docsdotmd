import { notFound } from "next/navigation"

import { SpaceShell } from "@/components/layout/space-shell"
import { canEditSpace, getOrgContext, getSpace, getSpacePages } from "@/lib/data"
import { buildPageTree } from "@/lib/pages-tree"

export default async function SpaceLayout({ children, params }: LayoutProps<"/[org]/[space]">) {
  const { org: orgSlug, space: spaceSlug } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()
  // Un espacio restringido sin acceso responde igual que uno que no existe.
  const space = await getSpace(context.org.id, spaceSlug)
  if (!space) notFound()

  const [pages, canEdit] = await Promise.all([getSpacePages(space.id), canEditSpace(space.id)])

  return (
    <SpaceShell
      sidebar={{
        tree: buildPageTree(pages),
        orgSlug,
        spaceSlug,
        spaceId: space.id,
        spaceName: space.name,
        canEdit,
      }}
    >
      {children}
    </SpaceShell>
  )
}
