"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, ExternalLink, Lock, Pencil, Plus, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { deleteSpace, moveSpace, saveSpace } from "@/actions/spaces"
import { TextField } from "@/components/forms/text-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SpacePermission, SpaceVisibility } from "@/lib/constants"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { DocIcon, ICON_NAMES } from "@/lib/icons"
import { slugify } from "@/lib/slug"
import { spaceFormSchema, type SpaceFormInput } from "@/lib/validators"

import { ConfirmDialog } from "./confirm-dialog"

const s = t.settings.spaces
const NONE = "none"

type GroupOption = { id: string; name: string }
type SpaceRow = {
  id: string
  name: string
  slug: string
  icon: string
  visibility: SpaceVisibility
  groups: { groupId: string; permission: SpacePermission }[]
}

export function SpaceDialog({
  orgId,
  groups,
  space,
}: {
  orgId: string
  groups: GroupOption[]
  space?: SpaceRow
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const defaults: SpaceFormInput = {
    name: space?.name ?? "",
    slug: space?.slug ?? "",
    icon: space?.icon ?? "book-open",
    visibility: space?.visibility ?? "org",
    groups: space?.groups ?? [],
  }
  const form = useForm<SpaceFormInput>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: defaults,
  })
  const visibility = useWatch({ control: form.control, name: "visibility" })
  const access = useWatch({ control: form.control, name: "groups" })

  function setGroupPermission(groupId: string, value: string) {
    const rest = access.filter((item) => item.groupId !== groupId)
    form.setValue(
      "groups",
      value === NONE ? rest : [...rest, { groupId, permission: value as SpacePermission }],
      { shouldDirty: true },
    )
  }

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveSpace({ orgId, spaceId: space?.id, ...values })
      if (!result.ok) {
        if (!applyFieldErrors(result, form.setError, ["name", "slug", "icon", "visibility"]))
          toast.error(result.error)
        return
      }
      toast.success(s.saved)
      setOpen(false)
    })
  })

  // En un espacio nuevo, el slug sigue al nombre hasta que se edita a mano.
  const nameField = form.register("name", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!space && !form.getFieldState("slug").isDirty)
        form.setValue("slug", slugify(event.target.value))
    },
  })
  const { errors } = form.formState

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) form.reset(defaults)
      }}
    >
      <DialogTrigger asChild>
        {space ? (
          <Button variant="ghost" size="icon-sm" aria-label={`${s.editTitle}: ${space.name}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus data-icon="inline-start" />
            {s.new}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{space ? s.editTitle : s.newTitle}</DialogTitle>
          <DialogDescription>{s.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <TextField
              id="space-name"
              label={s.name}
              placeholder={s.namePlaceholder}
              error={errors.name?.message}
              {...nameField}
            />
            <TextField
              id="space-slug"
              label={s.slug}
              spellCheck={false}
              error={errors.slug?.message}
              {...form.register("slug")}
            />
            <Controller
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="space-icon">{s.icon}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="space-icon" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {ICON_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          <DocIcon name={name} />
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">{s.visibility}</FieldLegend>
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    {(["org", "restricted"] as const).map((value) => (
                      <Field key={value} orientation="horizontal">
                        <RadioGroupItem value={value} id={`visibility-${value}`} />
                        <div className="flex flex-col gap-0.5">
                          <FieldLabel htmlFor={`visibility-${value}`} className="font-medium">
                            {value === "org" ? s.visibilityOrg : s.visibilityRestricted}
                          </FieldLabel>
                          <FieldDescription>
                            {value === "org" ? s.visibilityOrgHelp : s.visibilityRestrictedHelp}
                          </FieldDescription>
                        </div>
                      </Field>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />
            {visibility === "restricted" ? (
              <FieldSet>
                <FieldLegend variant="label">{s.groupsAccess}</FieldLegend>
                {groups.length === 0 ? (
                  <FieldDescription>{s.noGroups}</FieldDescription>
                ) : (
                  <div className="flex flex-col gap-2">
                    {groups.map((group) => {
                      const current =
                        access.find((item) => item.groupId === group.id)?.permission ?? NONE
                      return (
                        <div key={group.id} className="flex items-center justify-between gap-3">
                          <span className="text-sm">{group.name}</span>
                          <Select
                            value={current}
                            onValueChange={(value) => setGroupPermission(group.id, value)}
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-36"
                              aria-label={`${s.groupsAccess}: ${group.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NONE}>{s.noAccess}</SelectItem>
                              <SelectItem value="read">{s.permissionRead}</SelectItem>
                              <SelectItem value="edit">{s.permissionEdit}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    })}
                  </div>
                )}
              </FieldSet>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner /> : null}
                {s.save}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SpacesTable({
  orgId,
  orgSlug,
  spaces,
  groups,
}: {
  orgId: string
  orgSlug: string
  spaces: SpaceRow[]
  groups: GroupOption[]
}) {
  const [pending, startTransition] = useTransition()
  const groupName = (id: string) => groups.find((group) => group.id === id)?.name ?? "—"

  function move(spaceId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveSpace({ orgId, spaceId, direction })
      if (!result.ok) toast.error(result.error)
    })
  }

  if (!spaces.length) return <p className="text-sm text-muted-foreground">{s.empty}</p>

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{s.name}</TableHead>
            <TableHead>{s.visibility}</TableHead>
            <TableHead className="w-44">
              <span className="sr-only">{t.common.edit}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.map((space, index) => (
            <TableRow key={space.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <DocIcon name={space.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{space.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      /{space.slug}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {space.visibility === "org" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Users /> {s.visibilityOrg}
                  </Badge>
                ) : (
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="outline" className="gap-1">
                      <Lock /> {s.visibilityRestricted}
                    </Badge>
                    {space.groups.map((access) => (
                      <Badge key={access.groupId} variant="secondary" className="font-normal">
                        {groupName(access.groupId)} ·{" "}
                        {access.permission === "edit" ? s.permissionEdit : s.permissionRead}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending || index === 0}
                    aria-label={`${s.moveUp}: ${space.name}`}
                    onClick={() => move(space.id, "up")}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending || index === spaces.length - 1}
                    aria-label={`${s.moveDown}: ${space.name}`}
                    onClick={() => move(space.id, "down")}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${s.open}: ${space.name}`}
                  >
                    <Link href={`/${orgSlug}/${space.slug}`}>
                      <ExternalLink />
                    </Link>
                  </Button>
                  <SpaceDialog orgId={orgId} groups={groups} space={space} />
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${s.delete}: ${space.name}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    }
                    title={s.delete}
                    description={s.deleteConfirm(space.name)}
                    onConfirm={async () => {
                      const result = await deleteSpace({ orgId, spaceId: space.id })
                      if (!result.ok) {
                        toast.error(result.error)
                        return false
                      }
                      toast.success(s.deleted)
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
