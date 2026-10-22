"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

// next-themes inyecta un <script> que aplica el tema antes de pintar. Debe
// ejecutarse en el HTML del servidor; si React vuelve a crearlo en el navegador
// (por ejemplo al mostrar la página 404) ya no se ejecutaría y React avisa
// "Encountered a script tag". En el navegador se marca como bloque de datos y
// el aviso desaparece (el script ya trae suppressHydrationWarning).
const scriptProps = typeof window === "undefined" ? undefined : { type: "application/json" }

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider scriptProps={scriptProps} {...props} />
}
