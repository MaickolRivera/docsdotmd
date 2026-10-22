import { cn } from "@/lib/utils"

/**
 * Marca de DOCSmd: hoja con esquina doblada, en blanco sobre negro. Es el mismo
 * dibujo que src/app/icon.svg (el favicon), sin máscara para no repetir IDs
 * cuando el logo aparece varias veces en la página.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect width="512" height="512" fill="#000" />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="19.4739"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M295.909 145V308.567H160" />
        <path d="M157.656 142H285.704C295.688 142 303.675 145.5 309.666 152.499L347.5 191C232 300 355.344 210.022 355.344 218.771V351.315C355.344 364.438 370.32 371 355.344 371H157.656C142.68 371 157.656 364.438 157.656 351.315V161.685C157.656 148.562 142.68 142 157.656 142Z" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>
        DOCS<span className="text-primary">md</span>
      </span>
    </span>
  )
}
