import type { NextConfig } from "next"

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
}

export default nextConfig
