"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { t } from "@/lib/i18n"
import { DocIcon, ICON_ALIASES, ICON_NAMES } from "@/lib/icons"

/** Alias de cada icono, para encontrarlo también buscando "home", "pago"… */
const ALIASES_BY_ICON = Object.entries(ICON_ALIASES).reduce<Record<string, string[]>>(
  (map, [alias, name]) => {
    ;(map[name] ??= []).push(alias)
    return map
  },
  {},
)

/** Minúsculas y sin tildes: "configuración" encuentra el alias "configuracion". */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

/** Todos los iconos disponibles; al hacer clic se copia el nombre. */
export function IconGallery() {
  const [query, setQuery] = useState("")
  const term = normalize(query)

  const names = useMemo(() => {
    if (!term) return ICON_NAMES
    return ICON_NAMES.filter(
      (name) => name.includes(term) || ALIASES_BY_ICON[name]?.some((alias) => alias.includes(term)),
    )
  }, [term])

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name)
      toast.success(t.guide.icons.copied(name))
    } catch {
      toast.error(t.guide.icons.copyFailed)
    }
  }

  return (
    <div className="my-6 rounded-xl border">
      <div className="flex items-center gap-3 border-b p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.guide.icons.search}
            aria-label={t.guide.icons.search}
            className="pl-8"
          />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
          {t.guide.icons.count(names.length)}
        </span>
      </div>
      {names.length ? (
        <ul className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-4 md:grid-cols-5">
          {names.map((name) => {
            const aliases = ALIASES_BY_ICON[name]
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => void copy(name)}
                  aria-label={t.guide.icons.copy(name)}
                  title={aliases ? t.guide.icons.aliases(aliases) : undefined}
                  className="flex w-full flex-col items-center gap-2 rounded-lg px-1 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <DocIcon name={name} className="size-5 text-foreground" />
                  <span className="w-full truncate text-center font-mono text-[11px]">{name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          {t.guide.icons.empty(query.trim())}
        </p>
      )}
    </div>
  )
}
