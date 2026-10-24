"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { createOrganization } from "@/actions/orgs"
import { TextField } from "@/components/forms/text-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyFieldErrors } from "@/lib/form-errors"
import { t } from "@/lib/i18n"
import { slugify } from "@/lib/slug"
import { orgFormSchema, type OrgFormInput } from "@/lib/validators"

export function NewOrgForm() {
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  const form = useForm<OrgFormInput>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: { name: "", slug: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const result = await createOrganization(values)
      if (result && !result.ok) {
        if (!applyFieldErrors(result, form.setError, ["name", "slug"])) setError(result.error)
      }
    })
  })

  // El slug sigue al nombre hasta que la persona lo edita a mano (queda "dirty").
  const nameField = form.register("name", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!form.getFieldState("slug").isDirty) {
        form.setValue("slug", slugify(event.target.value), {
          shouldValidate: form.formState.isSubmitted,
        })
      }
    },
  })
  const slugField = form.register("slug")
  const slug = useWatch({ control: form.control, name: "slug" })
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
          error={errors.name?.message}
          {...nameField}
        />
        <TextField
          id="slug"
          label={t.orgs.newPage.slug}
          placeholder="acme"
          autoCapitalize="none"
          spellCheck={false}
          description={t.orgs.newPage.slugHelp(slug)}
          error={errors.slug?.message}
          {...slugField}
        />
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner /> : null}
          {t.orgs.newPage.submit}
        </Button>
      </FieldGroup>
    </form>
  )
}
