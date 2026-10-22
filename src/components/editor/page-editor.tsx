"use client"

import type { EditorView } from "@codemirror/view"
import { Ellipsis, Eye, History, Save, SquarePen, Trash2, TriangleAlert } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { uploadAttachment } from "@/actions/attachments"
import { deletePage, savePage } from "@/actions/pages"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import type { FieldErrors } from "@/lib/action-result"
import { invalid } from "@/lib/action-result"
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MIME_TYPES,
  isImageMimeType,
  type PageStatus,
} from "@/lib/constants"
import { t } from "@/lib/i18n"
import { resolveIconName } from "@/lib/icons"
import { slugify } from "@/lib/slug"
import { cn } from "@/lib/utils"
import { savePageSchema } from "@/lib/validators"

import { insertBlock, insertInline } from "./commands"
import {
  clearLocalDraft,
  readLocalDraft,
  sameFields,
  writeLocalDraft,
  type EditorFields,
  type LocalDraft,
} from "./local-draft"
import { MarkdownEditor } from "./markdown-editor"
import { EditorToolbar, type EditorAttachment } from "./toolbar"

// La vista previa carga Shiki y las gramáticas: va en su propio chunk.
const Preview = dynamic(() => import("./preview").then((mod) => mod.Preview), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex max-w-[720px] flex-col gap-3 px-6 py-8">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
})

const ROOT = "__root__"

export type PageEditorProps = {
  page: EditorFields & { id: string; updatedAt: string }
  parentOptions: { id: string; title: string; depth: number }[]
  attachments: EditorAttachment[]
  viewHref: string
  descendantCount: number
}

export function PageEditor({
  page,
  parentOptions,
  attachments: initialAttachments,
  viewHref: initialViewHref,
  descendantCount,
}: PageEditorProps) {
  const initial: EditorFields = {
    title: page.title,
    slug: page.slug,
    parentId: page.parentId,
    status: page.status,
    content: page.content,
  }
  const [fields, setFields] = useState<EditorFields>(initial)
  const [saved, setSaved] = useState<EditorFields>(initial)
  // El editor solo corre en el navegador (ssr: false), así que se puede leer localStorage al iniciar.
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(() =>
    readLocalDraft(page.id, initial, page.updatedAt),
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [viewHref, setViewHref] = useState(initialViewHref)
  const [attachments, setAttachments] = useState(initialAttachments)
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const viewRef = useRef<EditorView | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // El slug sigue al título mientras se derive de él y no se edite a mano.
  const slugFollowsTitle = useRef(page.slug === slugify(page.title, 80))
  const dirty = !sameFields(fields, saved)
  // Iconos escritos a mano que no existen: se avisa y se enlaza la lista de /guia.
  const unknownIcons = useMemo(() => {
    const names = new Set<string>()
    for (const match of fields.content.matchAll(/icon="([^"]*)"/g)) {
      if (match[1] && !resolveIconName(match[1])) names.add(match[1])
    }
    return [...names]
  }, [fields.content])

  function update(patch: Partial<EditorFields>) {
    setFields((current) => ({ ...current, ...patch }))
  }

  function onTitleChange(title: string) {
    update(slugFollowsTitle.current ? { title, slug: slugify(title, 80) } : { title })
  }

  function save() {
    if (saving) return
    const submitted = fields
    const parsed = savePageSchema.safeParse({ pageId: page.id, ...submitted })
    if (!parsed.success) {
      const failure = invalid(parsed.error)
      setErrors(failure.fieldErrors ?? {})
      toast.error(Object.values(failure.fieldErrors ?? {})[0] ?? failure.error)
      return
    }
    setErrors({})
    startSaving(async () => {
      const result = await savePage(parsed.data)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      setSaved(submitted)
      setViewHref(result.data.href)
      setLocalDraft(null)
      clearLocalDraft(page.id)
      toast.success(t.editor.saved)
    })
  }

  // Ctrl+S / Cmd+S en cualquier parte del editor.
  const saveRef = useRef(save)
  useLayoutEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Borrador local unos segundos después del último cambio.
  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => writeLocalDraft(page.id, fields), 2500)
    return () => clearTimeout(timer)
  }, [dirty, fields, page.id])

  // Aviso al salir sin guardar: cerrar la pestaña y enlaces internos.
  useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (!window.confirm(t.editor.leaveConfirm)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [dirty])

  async function uploadFiles(files: File[], at: number | null) {
    for (const file of files) {
      if (file.size > ATTACHMENT_MAX_BYTES) {
        toast.error(`${file.name}: ${t.editor.attachments.tooLarge}`)
        continue
      }
      if (!ATTACHMENT_MIME_TYPES[file.type]) {
        toast.error(`${file.name}: ${t.editor.attachments.typeNotAllowed}`)
        continue
      }
      const toastId = toast.loading(t.editor.attachments.uploading(file.name))
      const formData = new FormData()
      formData.set("pageId", page.id)
      formData.set("file", file)
      const result = await uploadAttachment(formData)
      if (!result.ok) {
        toast.error(result.error, { id: toastId })
        continue
      }
      toast.success(t.editor.attachments.uploaded, { id: toastId })
      const { id, fileName, mimeType, sizeBytes, markdown } = result.data
      setAttachments((list) => [
        { id, file_name: fileName, mime_type: mimeType, size_bytes: sizeBytes },
        ...list,
      ])
      const view = viewRef.current
      if (!view) continue
      const range = at === null ? undefined : { from: at, to: at }
      if (isImageMimeType(mimeType)) insertBlock(view, markdown, range)
      else insertInline(view, markdown, at ?? undefined)
    }
  }

  function removePage() {
    startDeleting(async () => {
      clearLocalDraft(page.id)
      const result = await deletePage({ pageId: page.id })
      // Si sale bien, deletePage redirige al espacio.
      if (result && !result.ok) toast.error(result.error)
    })
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-2.75rem)] min-h-[32rem] flex-col lg:h-[calc(100dvh-var(--header-height))]">
      {/* Barra superior: título, estado, guardar y ver página */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <SquarePen className="size-4 shrink-0 text-muted-foreground" />
        <Input
          value={fields.title}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label={t.editor.title}
          aria-invalid={errors.title ? true : undefined}
          placeholder={t.editor.titlePlaceholder}
          className="h-9 min-w-48 flex-1 border-transparent bg-transparent px-1 text-lg font-semibold shadow-none dark:bg-transparent"
        />
        <span
          aria-live="polite"
          className={cn(
            "hidden text-xs sm:inline",
            dirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
          )}
        >
          {dirty ? t.editor.unsaved : t.editor.upToDate}
        </span>
        <Select
          value={fields.status}
          onValueChange={(value) => update({ status: value as PageStatus })}
        >
          <SelectTrigger size="sm" aria-label={t.editor.status} className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">{t.common.draft}</SelectItem>
            <SelectItem value="published">{t.common.published}</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild variant="outline" size="sm">
          <Link href={viewHref}>
            <Eye data-icon="inline-start" />
            {t.editor.viewPage}
          </Link>
        </Button>
        <Button size="sm" onClick={save} disabled={saving} title={t.editor.shortcutHint}>
          {saving ? <Spinner /> : <Save data-icon="inline-start" />}
          {saving ? t.editor.saving : t.editor.save}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t.editor.moreActions}>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
              <Trash2 />
              {t.editor.deletePage}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Slug y página padre */}
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2 border-b px-4 py-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t.editor.slug}</span>
            <Input
              value={fields.slug}
              onChange={(event) => {
                slugFollowsTitle.current = false
                update({ slug: event.target.value })
              }}
              aria-invalid={errors.slug ? true : undefined}
              spellCheck={false}
              className="h-8 w-56 font-mono text-xs"
            />
          </span>
          {errors.slug ? <span className="text-xs text-destructive">{errors.slug}</span> : null}
        </label>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span id="parent-label" className="text-xs text-muted-foreground">
              {t.editor.parent}
            </span>
            <Select
              value={fields.parentId ?? ROOT}
              onValueChange={(value) => update({ parentId: value === ROOT ? null : value })}
            >
              <SelectTrigger size="sm" aria-labelledby="parent-label" className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT}>{t.editor.noParent}</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <span style={{ paddingLeft: `${option.depth * 0.75}rem` }}>{option.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
          {errors.parentId ? (
            <span className="text-xs text-destructive">{errors.parentId}</span>
          ) : null}
        </div>
        {errors.title || errors.content ? (
          <span className="self-center text-xs text-destructive">
            {errors.title ?? errors.content}
          </span>
        ) : null}
      </div>

      {localDraft ? (
        <Alert className="rounded-none border-x-0 border-t-0">
          <History />
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{t.editor.restoreTitle}</span>
            <span className="flex gap-2">
              <Button
                size="xs"
                onClick={() => {
                  const { savedAt: _savedAt, ...draft } = localDraft
                  setFields(draft)
                  slugFollowsTitle.current = false
                  setLocalDraft(null)
                }}
              >
                {t.editor.restore}
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  clearLocalDraft(page.id)
                  setLocalDraft(null)
                }}
              >
                {t.editor.discard}
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      <EditorToolbar
        getView={() => viewRef.current}
        attachments={attachments}
        onAttach={() => fileInputRef.current?.click()}
        onAttachmentDeleted={(id) =>
          setAttachments((list) => list.filter((item) => item.id !== id))
        }
      />
      {unknownIcons.length ? (
        <p
          role="status"
          className="flex items-center gap-2 border-b bg-amber-500/10 px-4 py-1.5 text-xs text-amber-700 dark:text-amber-400"
        >
          <TriangleAlert className="size-3.5 shrink-0" />
          <span>
            {t.editor.icons.unknown(unknownIcons)}{" "}
            <Link
              href="/guia#iconos"
              target="_blank"
              rel="noopener"
              className="font-medium underline underline-offset-2"
            >
              {t.editor.icons.seeAll}
            </Link>
          </span>
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ""
          if (files.length) void uploadFiles(files, null)
        }}
      />

      {/* En móvil se alterna con pestañas "Editar / Vista previa" */}
      <div role="tablist" className="flex border-b lg:hidden">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "relative flex-1 py-2 text-sm font-medium",
              mobileTab === tab
                ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground",
            )}
          >
            {tab === "edit" ? t.editor.tabEdit : t.editor.tabPreview}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-2">
        <div
          className={cn(
            "relative min-h-0 overflow-hidden lg:border-r",
            mobileTab !== "edit" && "max-lg:hidden",
          )}
        >
          <MarkdownEditor
            value={fields.content}
            onChange={(content) => update({ content })}
            onReady={(view) => {
              viewRef.current = view
            }}
            onFiles={(files, at) => void uploadFiles(files, at)}
          />
        </div>
        <div
          aria-label={t.editor.tabPreview}
          className={cn(
            "relative min-h-0 overflow-y-auto bg-muted/20",
            mobileTab !== "preview" && "max-lg:hidden",
          )}
        >
          <Preview title={fields.title} source={fields.content} />
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.editor.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.editor.deleteDescription(descendantCount)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault()
                removePage()
              }}
            >
              {deleting ? <Spinner /> : null}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
