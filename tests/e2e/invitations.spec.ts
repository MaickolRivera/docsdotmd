import { expect, test, type Browser } from "@playwright/test"

import { createConfirmedUser, login, uniqueEmail, USERS } from "./helpers"

async function inviteFromAcme(browser: Browser, email: string) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await login(page, USERS.ana.email)
  await page.goto("/acme/ajustes/miembros")
  await page.getByRole("button", { name: "Invitar" }).click()
  await page.getByLabel("Correo").fill(email)
  await page.getByRole("button", { name: "Crear invitación" }).click()
  const link = await page.getByRole("textbox", { name: "Copiar enlace" }).inputValue()
  expect(link).toContain("/invitacion/")
  await context.close()
  return new URL(link).pathname
}

test.describe("Invitaciones", () => {
  test("el owner invita, la persona entra con ese correo y acepta", async ({ browser }) => {
    const email = uniqueEmail("invitada")
    const invitationPath = await inviteFromAcme(browser, email)
    await createConfirmedUser(email, "Invitada-12345", "Invitada")

    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(invitationPath)
    await expect(page).toHaveURL(/\/login\?next=/)
    await page.getByLabel("Correo").fill(email)
    await page.getByLabel("Contraseña").fill("Invitada-12345")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL(new RegExp(invitationPath))
    await expect(page.getByText("Te invitaron a Acme con el rol Editor.")).toBeVisible()
    await page.getByRole("button", { name: "Aceptar invitación" }).click()

    await expect(page).toHaveURL(/\/acme\/docs\//)
    await expect(page.getByRole("link", { name: "Editar página" }).first()).toBeVisible()

    // El enlace es de un solo uso.
    await page.goto(invitationPath)
    await expect(page.getByText("Esta invitación ya se aceptó.")).toBeVisible()
    await context.close()
  })

  test("la invitación no sirve con otro correo", async ({ browser, page }) => {
    const invitationPath = await inviteFromAcme(browser, uniqueEmail("otra"))
    await login(page, USERS.gina.email)
    await page.goto(invitationPath)
    await expect(
      page.getByText(/Esta invitación es para .*Inicia sesión con ese correo/),
    ).toBeVisible()
    await expect(page.getByRole("button", { name: "Aceptar invitación" })).toHaveCount(0)
  })

  test("un token inventado no revela nada", async ({ page }) => {
    await login(page, USERS.leo.email)
    await page.goto(`/invitacion/${"x".repeat(43)}`)
    await expect(page.getByText("La invitación no es válida o ya se usó.")).toBeVisible()
  })
})
