import { defineConfig, devices } from "@playwright/test"

// Pruebas de extremo a extremo contra Supabase local (`pnpm db:start` +
// `pnpm db:reset`) con los usuarios de supabase/seed.sql.
// Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY (para crear usuarios de prueba) y MAILPIT_URL
// (opcional, para la prueba de recuperación de contraseña).

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "es-CO",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? `pnpm start --port ${PORT}` : `pnpm dev --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
