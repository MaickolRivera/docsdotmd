import type { NextConfig } from "next"

// La Content-Security-Policy no va aquí: depende de la URL de Supabase y se
// calcula en el proxy en cada petición (src/lib/security-headers.ts).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
]

const nextConfig: NextConfig = {
  // Toda la app depende de la sesión (RLS por cookies) y los accesos no
  // autorizados deben responder 404 real, así que se usa el renderizado
  // dinámico clásico en lugar de Cache Components.
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default nextConfig
