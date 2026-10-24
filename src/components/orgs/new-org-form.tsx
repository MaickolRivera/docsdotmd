"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { createOrganization } from "@/actions/orgs"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { newOrgSchema, type NewOrgInput } from "@/lib/validators"

/** Solo pide el nombre: la dirección (slug) se genera a partir de él en el servidor. */
export function NewOrgForm() {
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const form = useForm<NewOrgInput>({
    resolver: zodResolver(newOrgSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await createOrganization(values)
      if (result && !result.ok) {
        if (!applyFieldErrors(result, form.setError, ["name"])) setError(result.error)
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
          id="name"
          label={t.orgs.newPage.name}
          placeholder={t.orgs.newPage.namePlaceholder}
          autoComplete="organization"
          autoFocus
          error={errors.name?.message}
          {...form.register("name")}
        />
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : null}
          {t.orgs.newPage.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
