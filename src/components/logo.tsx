import { useId } from "react"

import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  // ID único por instancia: el logo aparece varias veces en la página.
  const clipId = useId()
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden
      className={cn("size-7 shrink-0 pb-0.5", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#${clipId})`}>
        <path d="M512 0H0V512H512V0Z" fill="#FAFAFB" />
        <path
          d="M165.656 141H293.704C331.811 141 363.344 171.892 363.344 210V370H165.656C150.68 370 165.656 363.438 165.656 350.315V160.685C165.656 147.561 150.68 141 165.656 141Z"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="#151A1D"
        />
        <path
          d="M257.553 365C528.139 204.485 188.192 430.371 224.794 154"
          strokeWidth="30"
          strokeLinecap="square"
          strokeLinejoin="round"
          stroke="#151A1D"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="512" height="512" rx="256" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>
        DOCS<span className="text-primary">dotmd</span>
      </span>
    </span>
  )
}
