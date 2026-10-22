import { expect, test } from "@playwright/test"

import {
  createConfirmedUser,
  latestEmailHtml,
  login,
  PASSWORD,
  uniqueEmail,
  USERS,
} from "./helpers"

test.describe("Autenticación", () => {
  test("sin sesión, una ruta privada lleva a /login y después vuelve a ella", async ({ page }) => {
    await page.goto("/acme/docs/introduccion")
    await expect(page).toHaveURL(/\/login\?next=%2Facme%2Fdocs%2Fintroduccion/)

    await page.getByLabel("Correo").fill(USERS.ana.email)
    await page.getByLabel("Contraseña").fill(PASSWORD)
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL(/\/acme\/docs\/introduccion$/)
    await expect(page.getByRole("heading", { level: 1, name: "Introducción" })).toBeVisible()
  })

  test("una contraseña incorrecta muestra un error", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Correo").fill(USERS.ana.email)
    await page.getByLabel("Contraseña").fill("no-es-la-clave")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test("cerrar sesión protege de nuevo las rutas privadas", async ({ page }) => {
    await login(page, USERS.leo.email)
    await expect(page).toHaveURL(/\/orgs$/)
    await page.getByRole("button", { name: "Menú de usuario" }).click()
    await page.getByRole("menuitem", { name: "Cerrar sesión" }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto("/orgs")
    await expect(page).toHaveURL(/\/login\?next=%2Forgs/)
  })

  test("recuperar la contraseña con el enlace del correo", async ({ page }) => {
    test.skip(!process.env.MAILPIT_URL, "Necesita Mailpit (Supabase local)")
    const email = uniqueEmail("recupera")
    await createConfirmedUser(email, "Inicial-12345")

    await page.goto("/recuperar")
    await page.getByLabel("Correo").fill(email)
    await page.getByRole("button", { name: "Enviar enlace" }).click()
    await expect(page.getByText("Revisa tu correo")).toBeVisible()

    const html = await latestEmailHtml(email)
    const link = html.match(/href="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&")
    expect(link, "enlace del correo").toBeTruthy()
    await page.goto(link!)
    await expect(page).toHaveURL(/\/actualizar-clave$/)

    await page.getByLabel("Contraseña nueva").fill("Nueva-clave-2026")
    await page.getByLabel("Repite la contraseña").fill("Nueva-clave-2026")
    await page.getByRole("button", { name: "Guardar contraseña" }).click()
    await expect(page).toHaveURL(/\/orgs$/)

    // La contraseña nueva sirve para entrar.
    await page.context().clearCookies()
    await login(page, email, "Nueva-clave-2026")
    await expect(page).toHaveURL(/\/orgs$/)
  })
})
