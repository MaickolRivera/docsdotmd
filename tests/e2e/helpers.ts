import { createClient } from "@supabase/supabase-js"
import { expect, type Page } from "@playwright/test"

// Datos de supabase/seed.sql (ficticios).
export const PASSWORD = "Demo-DOCSmd-2026"

export const USERS = {
  ana: { email: "ana@acme.test", name: "Ana Martínez" }, // owner de Acme
  eva: { email: "eva@acme.test", name: "Eva Torres" }, // editora de Acme, grupo Ingeniería
  leo: { email: "leo@acme.test", name: "Leo Gómez" }, // lector de Acme
  gina: { email: "gina@globex.test", name: "Gina Rojas" }, // owner de Globex
} as const

export const IDS = {
  acme: "a0000000-0000-4000-8000-000000000001",
  globex: "b0000000-0000-4000-8000-000000000001",
  acmeIntroduccion: "a3000000-0000-4000-8000-000000000001",
  acmeBorrador: "a3000000-0000-4000-8000-000000000006",
  acmeRunbook: "a3000000-0000-4000-8000-000000000031",
  globexBienvenida: "b3000000-0000-4000-8000-000000000001",
} as const

export function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable ${name} para las pruebas e2e`)
  return value
}

export async function login(page: Page, email: string, password = PASSWORD, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login")
  await page.getByLabel("Correo").fill(email)
  await page.getByLabel("Contraseña").fill(password)
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

/** Cliente de Supabase con la sesión de un usuario (para probar RLS directo). */
export async function supabaseAs(email: string, password = PASSWORD) {
  const client = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

/** Crea un usuario ya confirmado con la API de administración (solo en pruebas). */
export async function createConfirmedUser(
  email: string,
  password: string,
  fullName = "Persona de prueba",
) {
  const admin = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`
}

/** Último correo recibido por `to` en Mailpit (Supabase local). */
export async function latestEmailHtml(to: string): Promise<string> {
  const base = env("MAILPIT_URL").replace(/\/$/, "")
  for (let attempt = 0; attempt < 20; attempt++) {
    const search = await fetch(`${base}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`)
    const data = (await search.json()) as { messages?: { ID: string }[] }
    const id = data.messages?.[0]?.ID
    if (id) {
      const message = await fetch(`${base}/api/v1/message/${id}`)
      const body = (await message.json()) as { HTML?: string; Text?: string }
      return body.HTML ?? body.Text ?? ""
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`No llegó ningún correo para ${to}`)
}
