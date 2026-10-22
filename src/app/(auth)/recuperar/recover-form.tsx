"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, MailCheck } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { requestPasswordReset } from "@/actions/auth"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { t } from "@/lib/i18n"
import { recoverSchema, type RecoverInput } from "@/lib/validators"

export function RecoverForm() {
  const [error, setError] = useState<string>()
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await requestPasswordReset(values)
      if (result.ok) setSent(true)
      else setError(result.error)
    })
  })

  if (sent) {
    return (
      <Alert>
        <MailCheck />
        <AlertTitle>{t.auth.recover.sentTitle}</AlertTitle>
        <AlertDescription>{t.auth.recover.sent}</AlertDescription>
      </Alert>
    )
  }

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
          id="email"
          type="email"
          autoComplete="email"
          label={t.auth.email}
          placeholder={t.auth.emailPlaceholder}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Spinner /> : null}
          {t.auth.recover.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
