"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Plus, Trash2, UsersRound, X } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  addGroupMember,
  createGroup,
  deleteGroup,
  removeGroupMember,
  renameGroup,
} from "@/actions/groups"
import { TextField } from "@/components/forms/text-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { SpacePermission } from "@/lib/constants"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { groupFormSchema, type GroupFormInput } from "@/lib/validators"

import { ConfirmDialog } from "./confirm-dialog"

const g = t.settings.groups

type MemberOption = { id: string; name: string; email: string }

/** Diálogo para crear o renombrar un grupo. */
function GroupNameDialog({
  trigger,
  title,
  initialName = "",
  submitLabel,
  onSubmit,
}: {
  trigger: React.ReactElement
  title: string
  initialName?: string
  submitLabel: string
  onSubmit: (
    values: GroupFormInput,
  ) => Promise<{ ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }>
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<GroupFormInput>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: { name: initialName },
  })

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await onSubmit(values)
      if (!result.ok) {
        if (!applyFieldErrors(result, form.setError, ["name"])) toast.error(result.error)
        return
      }
      setOpen(false)
      form.reset({ name: initialName })
    })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) form.reset({ name: initialName })
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{g.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <TextField
              id="group-name"
              label={g.name}
              placeholder={g.namePlaceholder}
              autoFocus
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner /> : null}
                {submitLabel}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateGroupDialog({ orgId }: { orgId: string }) {
  return (
    <GroupNameDialog
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          {g.new}
        </Button>
      }
      title={g.new}
      submitLabel={g.create}
      onSubmit={async (values) => {
        const result = await createGroup({ orgId, ...values })
        return result.ok ? { ok: true } : result
      }}
    />
  )
}

export function GroupCard({
  orgId,
  group,
  members,
  spaces,
}: {
  orgId: string
  group: { id: string; name: string; memberIds: string[] }
  members: MemberOption[]
  spaces: { name: string; permission: SpacePermission }[]
}) {
  const [selected, setSelected] = useState<string>()
  const [pending, startTransition] = useTransition()
  const inGroup = members.filter((member) => group.memberIds.includes(member.id))
  const available = members.filter((member) => !group.memberIds.includes(member.id))

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) toast.error(result.error ?? t.common.genericError)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="size-4 text-muted-foreground" />
          <h2>{group.name}</h2>
          <Badge variant="secondary">{g.membersCount(inGroup.length)}</Badge>
        </CardTitle>
        <div className="flex gap-1">
          <GroupNameDialog
            trigger={
              <Button variant="ghost" size="sm">
                <Pencil data-icon="inline-start" />
                {g.rename}
              </Button>
            }
            title={g.rename}
            initialName={group.name}
            submitLabel={t.common.save}
            onSubmit={async (values) => {
              const result = await renameGroup({ orgId, groupId: group.id, ...values })
              if (result.ok) toast.success(g.renamed)
              return result.ok ? { ok: true } : result
            }}
          />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 data-icon="inline-start" />
                {t.common.delete}
              </Button>
            }
            title={g.delete}
            description={g.deleteConfirm(group.name)}
            onConfirm={async () => {
              const result = await deleteGroup({ orgId, groupId: group.id })
              if (!result.ok) {
                toast.error(result.error)
                return false
              }
              toast.success(g.deleted)
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {spaces.length ? (
          <p className="text-sm text-muted-foreground">
            {g.spacesAccess}:{" "}
            {spaces.map((space, index) => (
              <span key={space.name}>
                {index > 0 ? ", " : ""}
                <span className="text-foreground">{space.name}</span> (
                {space.permission === "edit"
                  ? t.settings.spaces.permissionEdit
                  : t.settings.spaces.permissionRead}
                )
              </span>
            ))}
          </p>
        ) : null}

        {inGroup.length ? (
          <ul className="flex flex-wrap gap-2">
            {inGroup.map((member) => (
              <li key={member.id}>
                <Badge variant="outline" className="h-7 gap-1 pr-1 pl-2.5 text-sm font-normal">
                  {member.name}
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={`${g.removeMember}: ${member.name}`}
                    onClick={() =>
                      run(() => removeGroupMember({ orgId, groupId: group.id, userId: member.id }))
                    }
                    className="ml-0.5 flex size-5 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{g.emptyMembers}</p>
        )}

        {available.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selected ?? ""} onValueChange={setSelected}>
              <SelectTrigger size="sm" className="w-64" aria-label={g.selectMember}>
                <SelectValue placeholder={g.selectMember} />
              </SelectTrigger>
              <SelectContent>
                {available.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={!selected || pending}
              onClick={() => {
                if (!selected) return
                const userId = selected
                setSelected(undefined)
                run(() => addGroupMember({ orgId, groupId: group.id, userId }))
              }}
            >
              {pending ? <Spinner /> : <Plus data-icon="inline-start" />}
              {g.add}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
