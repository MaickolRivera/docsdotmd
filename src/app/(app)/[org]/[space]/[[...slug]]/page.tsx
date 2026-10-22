import { FileText } from "lucide-react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { DocArticle } from "@/components/docs/doc-article"
import { CreatePageButton } from "@/components/layout/create-page-button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { canEditSpace, getOrgContext, getPageContent, getSpace, getSpacePages } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getToc } from "@/lib/markdown/toc"
import { buildPageTree, editorHref, flattenTree, getPrevNext, pageHref } from "@/lib/pages-tree"

type Props = PageProps<"/[org]/[space]/[[...slug]]">

/**
 * Busca la página por organización, espacio y slug. Si RLS no la devuelve (no
 * existe, es un borrador ajeno o el espacio no corresponde) responde 404.
 */
async function resolvePage({ params }: Props) {
  const { org: orgSlug, space: spaceSlug, slug = [] } = await params
  const context = await getOrgContext(orgSlug)
  if (!context) notFound()
  const space = await getSpace(context.org.id, spaceSlug)
  if (!space) notFound()

  const [pages, canEdit] = await Promise.all([getSpacePages(space.id), canEditSpace(space.id)])
  const flat = flattenTree(buildPageTree(pages))
  const node = slug.length ? flat.find((page) => page.slug === slug.at(-1)) : undefined
  return { orgSlug, spaceSlug, slug, space, flat, node, canEdit }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { node, space } = await resolvePage(props)
  return { title: node ? node.title : space.name }
}

export default async function DocPage(props: Props) {
  const { orgSlug, spaceSlug, slug, space, flat, node, canEdit } = await resolvePage(props)

  // /[org]/[space] muestra la primera página del espacio.
  if (!slug.length) {
    if (flat[0]) redirect(pageHref(orgSlug, spaceSlug, flat[0]))
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>{t.reader.emptySpaceTitle}</EmptyTitle>
            <EmptyDescription>
              {canEdit ? t.reader.emptySpaceEditor : t.reader.emptySpaceViewer}
            </EmptyDescription>
          </EmptyHeader>
          {canEdit ? (
            <EmptyContent>
              <CreatePageButton spaceId={space.id} label={t.reader.createFirst} />
            </EmptyContent>
          ) : null}
        </Empty>
      </main>
    )
  }

  if (!node) notFound()
  // La ruta canónica incluye a los padres: /espacio/padre/hija.
  if (node.path.join("/") !== slug.join("/")) redirect(pageHref(orgSlug, spaceSlug, node))

  const page = await getPageContent(node.id)
  if (!page) notFound()

  const { prev, next } = getPrevNext(flat, node.id)
  const link = (item: typeof node) => ({
    title: item.title,
    href: pageHref(orgSlug, spaceSlug, item),
  })
  const ancestors = node.path
    .slice(0, -1)
    .map((_, index) =>
      flat.find((item) => item.path.join("/") === node.path.slice(0, index + 1).join("/")),
    )
    .filter((item) => item !== undefined)
    .map(link)
  const author = page.updated_by_profile?.full_name

  return (
    <DocArticle
      pageId={page.id}
      spaceName={space.name}
      ancestors={ancestors}
      title={page.title}
      status={page.status}
      content={page.content_md}
      updatedLabel={
        author
          ? t.reader.updatedBy(author, formatDate(page.updated_at))
          : t.reader.updatedAt(formatDate(page.updated_at))
      }
      toc={getToc(page.content_md)}
      editHref={canEdit ? editorHref(orgSlug, spaceSlug, page.id) : undefined}
      prev={prev ? link(prev) : null}
      next={next ? link(next) : null}
    />
  )
}
