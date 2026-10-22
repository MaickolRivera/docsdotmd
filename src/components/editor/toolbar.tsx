"use client"

import type { EditorView } from "@codemirror/view"
import {
  Bold,
  BookOpen,
  Code,
  FileText,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Paperclip,
  Plus,
  Table,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { deleteAttachment } from "@/actions/attachments"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isImageMimeType } from "@/lib/constants"
import { formatBytes } from "@/lib/format"
import { t } from "@/lib/i18n"

import { insertBlock, insertInline, prefixLines, wrapSelection } from "./commands"
import { COMPONENT_TEMPLATES } from "./templates"

export type EditorAttachment = {
  id: string
  file_name: string
  mime_type: string
  size_bytes: number
}

type ToolbarProps = {
  getView: () => EditorView | null
  attachments: EditorAttachment[]
  onAttach: () => void
  onAttachmentDeleted: (id: string) => void
}

const tb = t.editor.toolbar
const tpl = t.editor.templates

function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={label} onClick={onClick}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function EditorToolbar({
  getView,
  attachments,
  onAttach,
  onAttachmentDeleted,
}: ToolbarProps) {
  const [deleting, startDeleting] = useTransition()

  function run(action: (view: EditorView) => void) {
    const view = getView()
    if (view) action(view)
  }

  function insertAttachment(attachment: EditorAttachment) {
    const label = attachment.file_name.replace(/[[\]\\]/g, "")
    run((view) =>
      isImageMimeType(attachment.mime_type)
        ? insertBlock(view, `![${label}](attachment:${attachment.id})`)
        : insertInline(view, `[${label}](attachment:${attachment.id})`),
    )
  }

  function removeAttachment(id: string) {
    startDeleting(async () => {
      const result = await deleteAttachment({ attachmentId: id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      onAttachmentDeleted(id)
      toast.success(t.editor.attachments.deleted)
    })
  }

  return (
    <div
      role="toolbar"
      aria-label={t.editor.tabEdit}
      className="flex items-center gap-0.5 overflow-x-auto border-b px-3 py-1.5"
    >
      <ToolButton
        icon={Bold}
        label={tb.bold}
        onClick={() => run((v) => wrapSelection(v, "**", "**", tpl.bold))}
      />
      <ToolButton
        icon={Italic}
        label={tb.italic}
        onClick={() => run((v) => wrapSelection(v, "_", "_", tpl.italic))}
      />
      <ToolButton
        icon={Heading2}
        label={tb.heading}
        onClick={() => run((v) => prefixLines(v, "## ", tpl.heading))}
      />
      <ToolButton
        icon={List}
        label={tb.list}
        onClick={() => run((v) => prefixLines(v, "- ", tpl.listItem))}
      />
      <ToolButton
        icon={Link2}
        label={tb.link}
        onClick={() => run((v) => wrapSelection(v, "[", "](https://)", tpl.link))}
      />
      <ToolButton
        icon={Code}
        label={tb.code}
        onClick={() => run((v) => wrapSelection(v, "`", "`", tpl.code))}
      />
      <ToolButton
        icon={Table}
        label={tb.table}
        onClick={() => run((v) => insertBlock(v, tpl.table))}
      />

      <Separator orientation="vertical" className="mx-1.5 h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="shrink-0">
            <Plus data-icon="inline-start" />
            {tb.insert}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {tb.insert}
          </DropdownMenuLabel>
          {COMPONENT_TEMPLATES.map((template) => (
            <DropdownMenuItem
              key={template.key}
              onSelect={() =>
                run((view) =>
                  template.inline
                    ? insertInline(view, template.text)
                    : insertBlock(view, template.text),
                )
              }
              className="items-start"
            >
              <template.icon className="mt-0.5" />
              <span className="flex flex-col">
                <span className="font-medium">{template.label}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                /{template.key}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* En otra pestaña, para no perder lo que se está escribiendo. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/guia" target="_blank" rel="noopener">
              <BookOpen data-icon="inline-start" />
              {tb.guide}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tb.guideHint}</TooltipContent>
      </Tooltip>

      <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onAttach}>
        <Paperclip data-icon="inline-start" />
        {tb.attach}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
          >
            {t.editor.attachments.title} ({attachments.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-2">
          <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">
            {t.editor.attachments.title}
          </p>
          {attachments.length === 0 ? (
            <p className="px-2 pb-2 text-sm text-muted-foreground">{t.editor.attachments.empty}</p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {attachments.map((attachment) => {
                const Icon = isImageMimeType(attachment.mime_type) ? ImageIcon : FileText
                return (
                  <li
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{attachment.file_name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatBytes(attachment.size_bytes)}
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`${t.editor.attachments.insert}: ${attachment.file_name}`}
                      title={t.editor.attachments.insert}
                      onClick={() => insertAttachment(attachment)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={deleting}
                      aria-label={`${t.editor.attachments.delete}: ${attachment.file_name}`}
                      title={t.editor.attachments.delete}
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
