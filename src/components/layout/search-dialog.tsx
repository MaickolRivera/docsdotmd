"use client"

import { FileText, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { t } from "@/lib/i18n"
import { DocIcon } from "@/lib/icons"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type SearchResult = Database["public"]["Functions"]["search_pages"]["Returns"][number]

/** Resalta las coincidencias que marcó ts_headline entre ⟦ y ⟧. */
function Snippet({ text }: { text: string }) {
  const parts = text.split(/(⟦[^⟧]*⟧)/g)
  return (
    <span className="line-clamp-2 text-xs text-muted-foreground">
      {parts.map((part, index) =>
        part.startsWith("⟦") ? (
          <mark key={index} className="rounded-sm bg-primary/15 px-0.5 text-foreground">
            {part.slice(1, -1)}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </span>
  )
}

/**
 * Buscador Ctrl+K. Consulta search_pages (texto completo de Postgres) desde el
 * navegador con la sesión del usuario: RLS solo devuelve lo que puede ver.
 */
export function SearchDialog({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  // Última respuesta recibida y el término que la produjo.
  const [response, setResponse] = useState<{
    term: string
    results: SearchResult[]
    error: boolean
  }>()
  const latest = useRef(0)
  const term = query.trim()
  const searching = term.length >= 2
  const loading = searching && response?.term !== term
  const results = useMemo(() => (searching ? (response?.results ?? []) : []), [searching, response])
  const error = searching && !loading && !!response?.error

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!searching) return
    const id = ++latest.current
    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc("search_pages", {
        p_org: orgId,
        p_query: term,
        p_limit: 20,
      })
      // Ignora respuestas de búsquedas anteriores.
      if (id !== latest.current) return
      if (rpcError) console.error("search_pages:", rpcError.message)
      setResponse({ term, results: data ?? [], error: !!rpcError })
    }, 200)
    return () => clearTimeout(timer)
  }, [term, searching, orgId, supabase])

  const groups = useMemo(() => {
    const bySpace = new Map<
      string,
      { name: string; slug: string; icon: string; items: SearchResult[] }
    >()
    for (const result of results) {
      const group = bySpace.get(result.space_id) ?? {
        name: result.space_name,
        slug: result.space_slug,
        icon: result.space_icon,
        items: [],
      }
      group.items.push(result)
      bySpace.set(result.space_id, group)
    }
    return [...bySpace.values()]
  }, [results])

  function go(result: SearchResult) {
    setOpen(false)
    setQuery("")
    // La página redirige a la ruta completa (padre/hija) si hace falta.
    router.push(`/${orgSlug}/${result.space_slug}/${result.slug}`)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={t.header.search}
        className="h-9 w-full max-w-sm justify-start gap-2 rounded-full bg-muted/40 px-3 font-normal text-muted-foreground shadow-none hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">{t.header.search}</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t.header.search}
        description={t.search.hint}
        className="sm:max-w-xl"
      >
        {/* CommandDialog no incluye la raíz de cmdk. El filtrado lo hace Postgres:
            cmdk no debe volver a filtrar (compararía el texto con el id de cada resultado). */}
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.search.placeholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-[min(60vh,28rem)]">
            {!searching ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t.search.hint}</p>
            ) : loading && results.length === 0 ? (
              <p className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Spinner /> {t.search.loading}
              </p>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-destructive">{t.search.error}</p>
            ) : (
              <CommandEmpty>{t.search.empty(term)}</CommandEmpty>
            )}
            {groups.map((group) => (
              <CommandGroup
                key={group.slug}
                heading={
                  <span className="flex items-center gap-1.5">
                    <DocIcon name={group.icon} className="size-3.5" />
                    {group.name}
                  </span>
                }
              >
                {group.items.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => go(result)}
                    className="items-start gap-3 py-2"
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2 truncate font-medium">
                        {result.title}
                        {result.status === "draft" ? (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                            {t.common.draft}
                          </Badge>
                        ) : null}
                      </span>
                      {result.snippet ? <Snippet text={result.snippet} /> : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
