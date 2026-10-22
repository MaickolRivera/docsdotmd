import { expect, test } from "@playwright/test"

import { createConfirmedUser, login, uniqueEmail } from "./helpers"

test.describe("Organizaciones", () => {
  test("crear una organización deja al usuario como owner con la página de bienvenida", async ({
    page,
  }) => {
    const email = uniqueEmail("fundadora")
    await createConfirmedUser(email, "Fundadora-12345", "Fundadora")
    await login(page, email, "Fundadora-12345")

    await expect(page).toHaveURL(/\/orgs$/)
    await expect(page.getByText("Aún no perteneces a ninguna organización")).toBeVisible()
    await page.getByRole("link", { name: "Nueva organización" }).first().click()

    const slug = `e2e-${Date.now()}`
    await page.getByLabel("Nombre").fill("Organización de prueba")
    await page.getByLabel("Dirección").fill(slug)
    await page.getByRole("button", { name: "Crear organización" }).click()

    await expect(page).toHaveURL(new RegExp(`/${slug}/documentacion/bienvenida$`))
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida" })).toBeVisible()
    // Como owner ve los ajustes y puede editar.
    await expect(page.getByRole("link", { name: "Ajustes" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Editar página" }).first()).toBeVisible()
  })

  test("una dirección reservada o repetida muestra un error en el campo", async ({ page }) => {
    const email = uniqueEmail("slug")
    await createConfirmedUser(email, "Slug-12345")
    await login(page, email, "Slug-12345")
    await page.goto("/orgs/nueva")

    await page.getByLabel("Nombre").fill("Acme otra vez")
    await page.getByLabel("Dirección").fill("acme")
    await page.getByRole("button", { name: "Crear organización" }).click()
    await expect(page.getByText("Esa dirección ya está en uso.")).toBeVisible()

    await page.getByLabel("Dirección").fill("orgs")
    await page.getByRole("button", { name: "Crear organización" }).click()
    await expect(page.getByText("Esa dirección está reservada por la aplicación")).toBeVisible()
  })
})
