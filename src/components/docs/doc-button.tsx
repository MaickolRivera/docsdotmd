import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import type { ButtonVariant } from "@/lib/markdown/directives"

const VARIANTS: Record<ButtonVariant, "default" | "secondary" | "outline" | "ghost"> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
}

/** `:button[Texto]{href="/ruta" variant="primary"}` — botón de shadcn como enlace. */
export function DocButton({
  href,
  variant,
  children,
}: {
  href?: string
  variant?: string
  children?: ReactNode
}) {
  const buttonVariant = VARIANTS[(variant as ButtonVariant) ?? "primary"] ?? "default"
  if (!href) {
    return (
      <Button variant={buttonVariant} className="not-prose" disabled>
        {children}
      </Button>
    )
  }
  const external = /^https?:\/\//i.test(href)
  return (
    <Button asChild variant={buttonVariant} className="not-prose no-underline hover:no-underline">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      )}
    </Button>
  )
}
