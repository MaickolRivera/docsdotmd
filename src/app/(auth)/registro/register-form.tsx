"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, MailCheck } from "lucide-react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"

import { signUp } from "@/actions/auth"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { registerSchema, type RegisterInput } from "@/lib/validators"

export function RegisterForm({ next }: { next?: string }) {
  const [error, setError] = useState<string>()
  const [sentTo, setSentTo] = useState<string>()
  const [pending, startTransition] = useTransition()
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", acceptTerms: false },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await signUp(values, next)
      if (!result) return
      if (result.ok) {
        setSentTo(result.data.email)
        return
      }
      if (
        !applyFieldErrors(result, form.setError, ["fullName", "email", "password", "acceptTerms"])
      ) {
        setError(result.error)
      }
    })
  })

  if (sentTo) {
    return (
      <Alert>
        <MailCheck />
        <AlertTitle>{t.auth.register.checkEmailTitle}</AlertTitle>
        <AlertDescription>{t.auth.register.checkEmail(sentTo)}</AlertDescription>
      </Alert>
    )
  }

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
          id="fullName"
          autoComplete="name"
          label={t.auth.fullName}
          placeholder={t.auth.fullNamePlaceholder}
          error={errors.fullName?.message}
          {...form.register("fullName")}
        />
        <TextField
          id="email"
          type="email"
          autoComplete="email"
          label={t.auth.email}
          placeholder={t.auth.emailPlaceholder}
          error={errors.email?.message}
          {...form.register("email")}
        />
        <TextField
          id="password"
          type="password"
          autoComplete="new-password"
          label={t.auth.password}
          description={t.validation.passwordMin(8)}
          error={errors.password?.message}
          {...form.register("password")}
        />
        <Controller
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <Field orientation="horizontal" data-invalid={errors.acceptTerms ? true : undefined}>
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={errors.acceptTerms ? true : undefined}
              />
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="acceptTerms" className="inline leading-5 font-normal">
                  {t.auth.register.acceptPrefix}{" "}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="font-medium text-primary hover:underline"
                  >
                    {t.legal.terms}
                  </Link>{" "}
                  {t.auth.register.acceptAnd}{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="font-medium text-primary hover:underline"
                  >
                    {t.legal.privacy}
                  </Link>
                  .
                </FieldLabel>
                {errors.acceptTerms ? <FieldError>{errors.acceptTerms.message}</FieldError> : null}
              </div>
            </Field>
          )}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Spinner /> : null}
          {t.auth.register.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
