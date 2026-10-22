"use client"

import type { ComponentProps, ReactNode } from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps = ComponentProps<typeof Input> & {
  id: string
  label: ReactNode
  error?: string
  description?: ReactNode
}

/** Campo de texto con etiqueta, ayuda y error (shadcn Field + Input). */
export function TextField({ id, label, error, description, ...props }: TextFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        {...props}
      />
      {description && !error ? (
        <FieldDescription id={`${id}-description`}>{description}</FieldDescription>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  )
}
