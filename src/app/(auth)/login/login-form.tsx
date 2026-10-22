"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { signIn } from "@/actions/auth"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { loginSchema, type LoginInput } from "@/lib/validators"

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [error, setError] = useState(initialError)
  const [pending, startTransition] = useTransition()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await signIn(values, next)
      // Si todo sale bien, signIn redirige y no devuelve nada.
      if (result && !result.ok) {
        if (!applyFieldErrors(result, form.setError, ["email", "password"])) setError(result.error)
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
          autoComplete="current-password"
          label={t.auth.password}
          error={errors.password?.message}
          {...form.register("password")}
        />
        <Link href="/recuperar" className="-mt-3 self-end text-sm text-primary hover:underline">
          {t.auth.login.forgot}
        </Link>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Spinner /> : null}
          {t.auth.login.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
