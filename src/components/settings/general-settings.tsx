"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LogOut, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  deleteOrganization,
  leaveOrganization,
  transferOwnership,
  updateOrganization,
} from "@/actions/orgs"
import { TextField } from "@/components/forms/text-field"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { orgFormSchema, type OrgFormInput } from "@/lib/validators"

import { ConfirmDialog } from "./confirm-dialog"

const g = t.settings.general

export function OrgGeneralForm({
  orgId,
  name,
  slug,
  editable,
}: {
  orgId: string
  name: string
  slug: string
  editable: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const form = useForm<OrgFormInput>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: { name, slug },
  })

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateOrganization({ orgId, ...values })
      if (!result.ok) {
        if (!applyFieldErrors(result, form.setError, ["name", "slug"])) toast.error(result.error)
        return
      }
      toast.success(g.saved)
      form.reset(values)
      if (result.data.slug !== slug) router.replace(`/${result.data.slug}/ajustes`)
    })
  })

  const { errors, isDirty } = form.formState
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <TextField
          id="org-name"
          label={g.name}
          disabled={!editable}
          error={errors.name?.message}
          {...form.register("name")}
        />
        <TextField
          id="org-slug"
          label={g.slug}
          disabled={!editable}
          spellCheck={false}
          description={g.slugWarning}
          error={errors.slug?.message}
          {...form.register("slug")}
        />
        {editable ? (
          <div>
            <Button type="submit" disabled={pending || !isDirty}>
              {pending ? <Spinner /> : null}
              {t.common.save}
            </Button>
          </div>
        ) : null}
      </FieldGroup>
    </form>
  )
}

export function TransferOwnershipSection({
  orgId,
  candidates,
}: {
  orgId: string
  candidates: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [userId, setUserId] = useState<string>()
  const selected = candidates.find((candidate) => candidate.id === userId)

  if (!candidates.length) return <p className="text-sm text-muted-foreground">{g.transferEmpty}</p>

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field className="w-72">
        <FieldLabel htmlFor="transfer-to">{g.transferSelect}</FieldLabel>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger id="transfer-to" className="w-full">
            <SelectValue placeholder={g.transferSelect} />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <ConfirmDialog
        trigger={
          <Button variant="outline" disabled={!selected}>
            {g.transferSubmit}
          </Button>
        }
        title={g.transferConfirm(selected?.name ?? "")}
        description={g.transferDescription}
        confirmLabel={g.transferSubmit}
        destructive={false}
        onConfirm={async () => {
          if (!userId) return false
          const result = await transferOwnership({ orgId, userId })
          if (!result.ok) {
            toast.error(result.error)
            return false
          }
          toast.success(g.transferDone)
          router.refresh()
        }}
      />
    </div>
  )
}

export function LeaveOrgSection({ orgId, isLastOwner }: { orgId: string; isLastOwner: boolean }) {
  if (isLastOwner)
    return <p className="text-sm text-muted-foreground">{t.settings.members.lastOwner}</p>
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline">
          <LogOut data-icon="inline-start" />
          {g.leaveSubmit}
        </Button>
      }
      title={g.leaveConfirm}
      description={g.leaveDescription}
      confirmLabel={g.leaveSubmit}
      onConfirm={async () => {
        const result = await leaveOrganization(orgId)
        if (result && !result.ok) {
          toast.error(result.error)
          return false
        }
      }}
    />
  )
}

export function DeleteOrgSection({ orgId, slug }: { orgId: string; slug: string }) {
  const [confirmSlug, setConfirmSlug] = useState("")
  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive">
          <Trash2 data-icon="inline-start" />
          {g.deleteSubmit}
        </Button>
      }
      title={g.deleteConfirmTitle}
      description={g.deleteDescription}
      confirmDisabled={confirmSlug !== slug}
      onConfirm={async () => {
        const result = await deleteOrganization({ orgId, confirmSlug })
        if (result && !result.ok) {
          toast.error(result.error)
          return false
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor="confirm-slug">{g.deleteConfirmLabel(slug)}</FieldLabel>
        <Input
          id="confirm-slug"
          value={confirmSlug}
          onChange={(event) => setConfirmSlug(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
    </ConfirmDialog>
  )
}
