"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/**
 * Copia el texto del bloque de código más cercano (`[data-code-block]`). Se lee
 * del DOM para no enviar el código dos veces al navegador.
 */
export function CopyButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    const block = event.currentTarget.closest("[data-code-block]")
    const pre =
      block?.querySelector("[role=tabpanel]:not([hidden]) pre") ?? block?.querySelector("pre")
    const text = pre?.textContent ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t.docs.codeCopied : t.docs.copyCode}
      title={copied ? t.docs.codeCopied : t.docs.copyCode}
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      <span className="sr-only" aria-live="polite">
        {copied ? t.docs.codeCopied : ""}
      </span>
    </button>
  )
}
