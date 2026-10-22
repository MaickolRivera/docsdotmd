import type { ReactNode } from "react"

/** `::::columns` — dos columnas (separadas con ***); en móvil, una sola. */
export function Columns({ children }: { children?: ReactNode }) {
  return <div className="docs-columns">{children}</div>
}

export function Column({ children }: { children?: ReactNode }) {
  return <div className="docs-column">{children}</div>
}
