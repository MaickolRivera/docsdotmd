"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { updatePassword } from "@/actions/auth"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validators"

export function UpdatePasswordForm() {
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await updatePassword(values)
      if (result && !result.ok) {
        if (!applyFieldErrors(result, form.setError, ["password", "confirm"]))
          setError(result.error)
      }
    })
  })

  const { errors } = form.formState
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {error ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <TextField
          id="password"
          type="password"
          autoComplete="new-password"
          label={t.auth.updatePassword.password}
          description={t.validation.passwordMin(8)}
          error={errors.password?.message}
          {...form.register("password")}
        />
        <TextField
          id="confirm"
          type="password"
          autoComplete="new-password"
          label={t.auth.updatePassword.confirm}
          error={errors.confirm?.message}
          {...form.register("confirm")}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Spinner /> : null}
          {t.auth.updatePassword.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
