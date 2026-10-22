import type { ReactNode } from "react"

/** `:::steps` — círculos numerados con una línea vertical entre pasos. */
export function Steps({ children }: { children?: ReactNode }) {
  return (
    <div className="docs-steps" role="list">
      {children}
    </div>
  )
}

export function Step({ children }: { children?: ReactNode }) {
  return (
    <div className="docs-step" role="listitem">
      {children}
    </div>
  )
}
