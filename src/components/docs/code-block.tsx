import type { ComponentProps } from "react"

import { languageLabel } from "@/lib/markdown/highlight"

import { CopyButton } from "./copy-button"

type PreProps = ComponentProps<"pre"> & {
  node?: unknown
  "data-title"?: string
  "data-language"?: string
  "data-in-tabs"?: string
}

/** Marco oscuro de los bloques de código: título o lenguaje y botón de copiar. */
export function CodeBlock({
  node: _node,
  children,
  className,
  "data-title": title,
  "data-language": language,
  "data-in-tabs": inTabs,
  ...props
}: PreProps) {
  const pre = (
    <pre {...props} data-language={language} className={className}>
      {children}
    </pre>
  )

  // Dentro de pestañas, el encabezado y el botón de copiar los pone CodeTabs.
  if (inTabs === "true") return pre

  return (
    <figure
      data-code-block=""
      className="docs-code not-prose group/code my-6 overflow-hidden rounded-xl border border-code-border bg-code text-zinc-100 shadow-sm"
    >
      <figcaption className="flex h-10 items-center justify-between gap-2 border-b border-white/10 pr-2 pl-4 text-xs text-zinc-400">
        <span className="truncate font-medium">{title ?? languageLabel(language)}</span>
        <CopyButton />
      </figcaption>
      {pre}
    </figure>
  )
}
