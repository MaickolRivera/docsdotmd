import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageEditorLoader } from "@/components/editor/page-editor-loader"
import {
  canEditSpace,
  getOrgContext,
  getPageAttachments,
  getPageContent,
  getSpace,
  getSpacePages,
} from "@/lib/data"
import { t } from "@/lib/i18n"
import { buildPageTree, descendantIds, flattenTree, pageHref } from "@/lib/pages-tree"
import { idSchema } from "@/lib/validators"

export const metadata: Metadata = { title: t.editor.tabEdit }

/** Editor de una página. Solo para quien puede editar el espacio; el resto ve 404. */
export default async function EditPage({ params }: PageProps<"/[org]/[space]/editar/[pageId]">) {
  const { org: orgSlug, space: spaceSlug, pageId } = await params
  if (!idSchema.safeParse(pageId).success) notFound()

  const context = await getOrgContext(orgSlug)
  if (!context) notFound()
  const space = await getSpace(context.org.id, spaceSlug)
  if (!space) notFound()
  if (!(await canEditSpace(space.id))) notFound()

  const [page, pages, attachments] = await Promise.all([
    getPageContent(pageId),
    getSpacePages(space.id),
    getPageAttachments(pageId),
  ])
  if (!page || page.space_id !== space.id) notFound()

  const flat = flattenTree(buildPageTree(pages))
  const descendants = descendantIds(pages, page.id)
  // Una página no puede colgar de sí misma ni de sus subpáginas.
  const excluded = new Set([page.id, ...descendants])
  const node = flat.find((item) => item.id === page.id)

  return (
    <PageEditorLoader
      key={page.id}
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        parentId: page.parent_id,
        status: page.status,
        content: page.content_md,
        updatedAt: page.updated_at,
      }}
      parentOptions={flat
        .filter((item) => !excluded.has(item.id))
        .map((item) => ({ id: item.id, title: item.title, depth: item.depth }))}
      attachments={attachments}
      viewHref={node ? pageHref(orgSlug, spaceSlug, node) : `/${orgSlug}/${spaceSlug}`}
      descendantCount={descendants.length}
    />
  )
}
