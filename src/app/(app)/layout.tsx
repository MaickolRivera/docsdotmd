import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"

// La documentación es privada: nada de lo que hay detrás del login se indexa.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // El proxy ya redirige sin sesión; esto es una segunda barrera.
  await requireUser()
  return children
}
