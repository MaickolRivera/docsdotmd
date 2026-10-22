import { CircleAlert, Info, Lightbulb, OctagonAlert, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { t } from "@/lib/i18n"
import type { CalloutType } from "@/lib/markdown/directives"
import { cn } from "@/lib/utils"

const VARIANTS: Record<
  CalloutType,
  { icon: LucideIcon; className: string; iconClassName: string }
> = {
  info: {
    icon: Info,
    className: "border-primary/25 bg-primary/5 dark:bg-primary/10",
    iconClassName: "text-primary",
  },
  tip: {
    icon: Lightbulb,
    className: "border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  // Advertencia en tono cálido.
  warning: {
    icon: CircleAlert,
    className: "border-amber-500/30 bg-amber-500/8 dark:bg-amber-500/10",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    icon: OctagonAlert,
    className: "border-red-500/30 bg-red-500/5 dark:bg-red-500/10",
    iconClassName: "text-red-600 dark:text-red-400",
  },
}

function isCalloutType(value: unknown): value is CalloutType {
  return typeof value === "string" && value in VARIANTS
}

/** `:::callout{type="info" title="..."}` — recuadro con icono y color. */
export function Callout({
  type,
  title,
  children,
}: {
  type?: unknown
  title?: string
  children?: ReactNode
}) {
  const kind = isCalloutType(type) ? type : "info"
  const variant = VARIANTS[kind]
  const Icon = variant.icon
  return (
    <div
      role="note"
      aria-label={title ?? t.docs.callout[kind]}
      className={cn(
        "not-prose my-6 flex gap-3 rounded-xl border px-4 py-3.5 text-sm",
        variant.className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-[1.125rem] shrink-0", variant.iconClassName)} />
      <div className="min-w-0 flex-1 leading-6 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-foreground/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_p+p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {title ? <p className="mb-1 font-semibold text-foreground">{title}</p> : null}
        <div className="text-foreground/85">{children}</div>
      </div>
    </div>
  )
}
