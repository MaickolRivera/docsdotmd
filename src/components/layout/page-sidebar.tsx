"use client"

import { ArrowDown, ArrowUp, ChevronRight, ListOrdered, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createPage, movePage } from "@/actions/pages"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { t } from "@/lib/i18n"
import { editorHref, pageHref, type PageNode } from "@/lib/pages-tree"
import { cn } from "@/lib/utils"

export type PageSidebarProps = {
  tree: PageNode[]
  orgSlug: string
  spaceSlug: string
  spaceId: string
  spaceName: string
  canEdit: boolean
  onNavigate?: () => void
}

/** Árbol colapsable de páginas del espacio. */
export function PageSidebar({
  tree,
  orgSlug,
  spaceSlug,
  spaceId,
  spaceName,
  canEdit,
  onNavigate,
}: PageSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [reordering, setReordering] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggle(id: string) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addPage(parentId: string | null) {
    startTransition(async () => {
      const result = await createPage({ spaceId, parentId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      onNavigate?.()
      router.push(result.data.href)
    })
  }

  function move(pageId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await movePage({ pageId, direction })
      if (!result.ok) toast.error(result.error)
    })
  }

  function renderNodes(nodes: PageNode[]) {
    return (
      <ul className="flex flex-col gap-0.5">
        {nodes.map((node, index) => {
          const href = pageHref(orgSlug, spaceSlug, node)
          const active = pathname === href || pathname === editorHref(orgSlug, spaceSlug, node.id)
          const hasChildren = node.children.length > 0
          const isCollapsed = collapsed.has(node.id)
          return (
            <li key={node.id}>
              <div
                className={cn(
                  "group/item flex items-center gap-1 rounded-md pr-1 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(node.id)}
                    aria-label={isCollapsed ? t.sidebar.expand : t.sidebar.collapse}
                    aria-expanded={!isCollapsed}
                    className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-foreground/5"
                  >
                    <ChevronRight
                      className={cn("size-3.5 transition-transform", !isCollapsed && "rotate-90")}
                    />
                  </button>
                ) : (
                  <span className="size-6 shrink-0" />
                )}
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 py-1.5"
                >
                  <span className="truncate">{node.title}</span>
                  {node.status === "draft" ? (
                    <Badge
                      variant="outline"
                      className="h-4 shrink-0 px-1.5 text-[10px] font-normal"
                    >
                      {t.common.draft}
                    </Badge>
                  ) : null}
                </Link>
                {canEdit && reordering ? (
                  <span className="flex shrink-0 items-center">
                    <button
                      type="button"
                      disabled={pending || index === 0}
                      onClick={() => move(node.id, "up")}
                      aria-label={`${t.sidebar.moveUp}: ${node.title}`}
                      className="flex size-6 items-center justify-center rounded hover:bg-foreground/5 disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={pending || index === nodes.length - 1}
                      onClick={() => move(node.id, "down")}
                      aria-label={`${t.sidebar.moveDown}: ${node.title}`}
                      className="flex size-6 items-center justify-center rounded hover:bg-foreground/5 disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => addPage(node.id)}
                      aria-label={`${t.sidebar.newSubpage}: ${node.title}`}
                      className="flex size-6 items-center justify-center rounded hover:bg-foreground/5 disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </span>
                ) : null}
              </div>
              {hasChildren && !isCollapsed ? (
                <div className="ml-3 border-l pl-1.5">{renderNodes(node.children)}</div>
              ) : null}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <nav aria-label={t.sidebar.label} className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-5">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-foreground uppercase">
            {spaceName}
          </p>
          {tree.length ? (
            renderNodes(tree)
          ) : (
            <p className="px-2 py-2 text-sm text-muted-foreground">{t.sidebar.empty}</p>
          )}
        </div>
      </ScrollArea>
      {canEdit ? (
        <div className="flex items-center gap-2 border-t p-3 my-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={pending}
            onClick={() => addPage(null)}
          >
            {pending ? <Spinner /> : <Plus data-icon="inline-start" />}
            {t.sidebar.newPage}
          </Button>
          {tree.length > 0 ? (
            <Button
              size="sm"
              variant={reordering ? "secondary" : "ghost"}
              aria-pressed={reordering}
              onClick={() => setReordering((value) => !value)}
            >
              <ListOrdered data-icon="inline-start" />
              {reordering ? t.sidebar.doneReordering : t.sidebar.reorder}
            </Button>
          ) : null}
        </div>
      ) : null}
    </nav>
  )
}
