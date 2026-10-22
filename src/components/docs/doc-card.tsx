import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { t } from "@/lib/i18n"
import { DocIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

function isExternal(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:")
}

// El enlace del título se "estira" con ::after hasta cubrir toda la tarjeta:
// la tarjeta entera es clicable sin envolverla en un <a>, así los botones y
// enlaces del contenido no quedan anidados (<a> dentro de <a> no es HTML válido).
const stretchedLink =
  "after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring"

/** `:::card{title="..." icon="..." href="..."}` — tarjeta con icono, título y enlace. */
export function DocCard({
  title,
  icon,
  href,
  children,
}: {
  title?: string
  icon?: string
  href?: string
  children?: ReactNode
}) {
  const external = href ? isExternal(href) : false
  const label = title ?? <span className="sr-only">{t.docs.openLink}</span>

  let heading: ReactNode = title
  if (href && external) {
    heading = (
      <a href={href} target="_blank" rel="noopener noreferrer" className={stretchedLink}>
        {label}
      </a>
    )
  } else if (href) {
    heading = (
      <Link href={href} className={stretchedLink}>
        {label}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "docs-card not-prose relative my-4 flex gap-4 rounded-xl border bg-card p-5 text-sm transition-colors",
        href && "hover:border-primary/50 hover:bg-primary/[0.03]",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
        <DocIcon name={icon} fallback="file-text" />
      </span>
      <div className="min-w-0 flex-1">
        {heading ? (
          <p className="flex items-center gap-1 font-semibold text-foreground">
            {heading}
            {external ? (
              <ArrowUpRight aria-hidden className="size-3.5 text-muted-foreground" />
            ) : null}
          </p>
        ) : null}
        {children ? (
          // Los enlaces y botones del contenido quedan por encima del enlace estirado.
          <div className="mt-1 leading-6 text-muted-foreground [&_a]:relative [&_a]:z-10 [&_a:not([data-slot=button])]:font-medium [&_a:not([data-slot=button])]:text-primary hover:[&_a:not([data-slot=button])]:underline [&_button]:relative [&_button]:z-10 [&_p]:m-0 [&_p+p]:mt-2 [&_p:has([data-slot=button])]:mt-3 [&>[data-slot=button]]:mt-3">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}
