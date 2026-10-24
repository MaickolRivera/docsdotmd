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
    await page.getByRole("button", { name: "Nueva organización" }).first().click()

    // La dirección sale del nombre.
    const slug = `e2e-${Date.now()}`
    await page.getByLabel("Nombre").fill(slug.toUpperCase())
    await page.getByRole("button", { name: "Crear organización" }).click()

    await expect(page).toHaveURL(new RegExp(`/${slug}/documentacion/bienvenida$`))
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida" })).toBeVisible()
    // Como owner ve los ajustes y puede editar.
    await expect(page.getByRole("link", { name: "Ajustes" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Editar página" }).first()).toBeVisible()
  })

  test("un nombre que da una dirección reservada muestra un error en el campo", async ({
    page,
  }) => {
    const email = uniqueEmail("slug")
    await createConfirmedUser(email, "Slug-12345")
    await login(page, email, "Slug-12345")

    await page.getByRole("button", { name: "Nueva organización" }).first().click()
    await page.getByLabel("Nombre").fill("Orgs")
    await page.getByRole("button", { name: "Crear organización" }).click()
    await expect(page.getByText("Esa dirección está reservada por la aplicación")).toBeVisible()
  })

  test("un nombre repetido recibe una dirección con sufijo", async ({ page }) => {
    const email = uniqueEmail("repetida")
    await createConfirmedUser(email, "Repetida-12345")
    await login(page, email, "Repetida-12345")

    const name = `Repetida ${Date.now()}`
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    for (const expected of [slug, `${slug}-2`]) {
      await page.goto("/orgs")
      await page.getByRole("button", { name: "Nueva organización" }).first().click()
      await page.getByLabel("Nombre").fill(name)
      await page.getByRole("button", { name: "Crear organización" }).click()
      await expect(page).toHaveURL(new RegExp(`/${expected}/`))
    }
  })
})
