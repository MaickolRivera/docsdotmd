import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// En Next.js 16 el antiguo middleware.ts se llama proxy.ts.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Todo excepto archivos estáticos e imágenes optimizadas.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
}
