"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, MailCheck, UserPlus, X } from "lucide-react"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { changeMemberRole, inviteMember, removeMember, revokeInvitation } from "@/actions/members"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { ROLES, type Role } from "@/lib/constants"
import { formatDate, initials } from "@/lib/format"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { inviteFormSchema, type InviteFormInput } from "@/lib/validators"

import { ConfirmDialog } from "./confirm-dialog"

const m = t.settings.members

type Member = { userId: string; role: Role; joinedAt: string; fullName: string; email: string }
type Invitation = { id: string; email: string; role: Role; expires_at: string }

function RoleSelect({
  value,
  roles,
  disabled,
  onChange,
  label,
}: {
  value: Role
  roles: readonly Role[]
  disabled?: boolean
  onChange: (role: Role) => void
  label: string
}) {
  return (
    <Select value={value} onValueChange={(role) => onChange(role as Role)} disabled={disabled}>
      <SelectTrigger size="sm" aria-label={label} className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {t.roles[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MembersTable({
  orgId,
  members,
  currentUserId,
  currentRole,
}: {
  orgId: string
  members: Member[]
  currentUserId: string
  currentRole: Role
}) {
  const [pending, startTransition] = useTransition()
  const isOwner = currentRole === "owner"
  // Admin no gestiona owners ni puede convertir a nadie en owner.
  const assignable: readonly Role[] = isOwner ? ROLES : ROLES.filter((role) => role !== "owner")

  function changeRole(userId: string, role: Role) {
    startTransition(async () => {
      const result = await changeMemberRole({ orgId, userId, role })
      if (result.ok) toast.success(m.roleChanged)
      else toast.error(result.error)
    })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{m.name}</TableHead>
            <TableHead>{m.role}</TableHead>
            <TableHead className="hidden sm:table-cell">{m.joined}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{m.remove}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const name = member.fullName || member.email
            const isSelf = member.userId === currentUserId
            const manageable = !isSelf && (isOwner || member.role !== "owner")
            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {initials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {name}
                        {isSelf ? (
                          <span className="font-normal text-muted-foreground"> ({m.you})</span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {manageable ? (
                    <RoleSelect
                      value={member.role}
                      roles={assignable}
                      disabled={pending}
                      label={`${m.role}: ${name}`}
                      onChange={(role) => changeRole(member.userId, role)}
                    />
                  ) : (
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {t.roles[member.role]}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(member.joinedAt)}
                </TableCell>
                <TableCell>
                  {manageable ? (
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label={`${m.remove}: ${name}`}>
                          <X />
                        </Button>
                      }
                      title={m.removeConfirm(name)}
                      confirmLabel={m.remove}
                      onConfirm={async () => {
                        const result = await removeMember({ orgId, userId: member.userId })
                        if (!result.ok) {
                          toast.error(result.error)
                          return false
                        }
                        toast.success(m.removed)
                      }}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function InviteDialog({
  orgId,
  canInviteOwners,
}: {
  orgId: string
  canInviteOwners: boolean
}) {
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<{ link: string; emailSent: boolean }>()
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const roles: readonly Role[] = canInviteOwners ? ROLES : ROLES.filter((role) => role !== "owner")
  const form = useForm<InviteFormInput>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: "", role: "editor" },
  })

  function reset(next: boolean) {
    setOpen(next)
    if (!next) {
      setCreated(undefined)
      setCopied(false)
      form.reset()
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await inviteMember({ orgId, ...values })
      if (!result.ok) {
        if (!applyFieldErrors(result, form.setError, ["email", "role"])) toast.error(result.error)
        return
      }
      setCreated(result.data)
    })
  })

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus data-icon="inline-start" />
          {m.invite}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{created ? m.linkTitle : m.inviteTitle}</DialogTitle>
          <DialogDescription>
            {created ? (created.emailSent ? m.linkEmailSent : m.linkCopy) : m.inviteDescription}
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="flex flex-col gap-3">
            {created.emailSent ? (
              <Alert>
                <MailCheck />
                <AlertDescription>{m.linkEmailSent}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex gap-2">
              <Input
                readOnly
                value={created.link}
                aria-label={m.copyLink}
                className="font-mono text-xs"
                onFocus={(event) => event.target.select()}
              />
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(created.link)
                  setCopied(true)
                }}
              >
                {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                {copied ? t.common.copied : m.copyLink}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => reset(false)}>{t.common.close}</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <TextField
                id="invite-email"
                type="email"
                label={m.email}
                placeholder={t.auth.emailPlaceholder}
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.error ? true : undefined}>
                    <FieldLabel htmlFor="invite-role">{m.role}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="invite-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t.roles[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{t.roleDescriptions[field.value]}</FieldDescription>
                    {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                  </Field>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => reset(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner /> : null}
                  {m.send}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function InvitationsList({
  orgId,
  invitations,
}: {
  orgId: string
  invitations: Invitation[]
}) {
  const [now] = useState(() => Date.now())
  if (!invitations.length) return <p className="text-sm text-muted-foreground">{m.noPending}</p>
  return (
    <ul className="divide-y">
      {invitations.map((invitation) => {
        const expired = new Date(invitation.expires_at).getTime() < now
        return (
          <li
            key={invitation.id}
            className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{invitation.email}</p>
              <p className="text-xs text-muted-foreground">
                {expired ? m.expired : m.expires(formatDate(invitation.expires_at))}
              </p>
            </div>
            <Badge variant="secondary">{t.roles[invitation.role]}</Badge>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm">
                  {m.revoke}
                </Button>
              }
              title={`${m.revoke}: ${invitation.email}`}
              confirmLabel={m.revoke}
              onConfirm={async () => {
                const result = await revokeInvitation({ orgId, invitationId: invitation.id })
                if (!result.ok) {
                  toast.error(result.error)
                  return false
                }
                toast.success(m.revoked)
              }}
            />
          </li>
        )
      })}
    </ul>
  )
}
