import { defineConfig } from "@playwright/test"

// Pruebas unitarias sin navegador (renderizador de markdown, utilidades).
export default defineConfig({
  testDir: "./tests/unit",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
})
