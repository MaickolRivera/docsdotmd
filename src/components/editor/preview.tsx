"use client"

import { useDeferredValue } from "react"

import { t } from "@/lib/i18n"
import { DocsMarkdown } from "@/lib/markdown/render"

/**
 * Vista previa con el mismo renderizador del lector. useDeferredValue mantiene
 * la escritura fluida mientras se vuelve a renderizar el markdown.
 */
export function Preview({ title, source }: { title: string; source: string }) {
  const deferred = useDeferredValue(source)
  const startsWithTitle = /^\s*#\s/.test(deferred)

  return (
    <div className="mx-auto max-w-[720px] px-6 py-8">
      {startsWithTitle ? null : (
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      )}
      {deferred.trim() ? (
        <DocsMarkdown source={deferred} />
      ) : (
        <p className="text-sm text-muted-foreground">{t.editor.previewEmpty}</p>
      )}
    </div>
  )
}
