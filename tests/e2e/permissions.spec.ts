import { expect, test } from "@playwright/test"

import { IDS, login, supabaseAs, USERS } from "./helpers"

test.describe("Lector sin permiso para editar (Leo)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.leo.email)
  })

  test("no ve controles de edición ni de administración", async ({ page }) => {
    await page.goto("/acme/docs/introduccion")
    await expect(page.getByRole("heading", { level: 1, name: "Introducción" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Editar página" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Página", exact: true })).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Ajustes" })).toHaveCount(0)
  })

  test("el editor y los ajustes responden 404", async ({ page }) => {
    for (const path of [
      `/acme/docs/editar/${IDS.acmeIntroduccion}`,
      "/acme/ajustes",
      "/acme/ajustes/miembros",
      "/acme/ajustes/espacios",
    ]) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
    }
  })

  test("no ve borradores", async ({ page }) => {
    await page.goto("/acme/docs/introduccion")
    await expect(page.getByRole("link", { name: "Hoja de ruta" })).toHaveCount(0)
    const response = await page.goto("/acme/docs/hoja-de-ruta")
    expect(response?.status()).toBe(404)
  })

  test("RLS impide editar aunque se llame a la API directamente", async () => {
    const supabase = await supabaseAs(USERS.leo.email)
    const { data: updated } = await supabase
      .from("pages")
      .update({ title: "Cambiado por un lector" })
      .eq("id", IDS.acmeIntroduccion)
      .select("id")
    expect(updated ?? []).toEqual([])

    const { error } = await supabase.from("pages").insert({
      org_id: IDS.acme,
      space_id: "a1000000-0000-4000-8000-000000000001",
      title: "Intruso",
      slug: "intruso",
    })
    expect(error).not.toBeNull()
  })
})

test.describe("Espacio restringido", () => {
  test("es invisible para quien no está en el grupo", async ({ page }) => {
    await login(page, USERS.leo.email)
    await page.goto("/acme/docs/introduccion")
    const tabs = page.getByRole("navigation", { name: "Espacios" })
    await expect(tabs.getByRole("link", { name: "Documentación" })).toBeVisible()
    await expect(tabs.getByRole("link", { name: "Interno" })).toHaveCount(0)

    for (const path of ["/acme/interno", "/acme/interno/runbook"]) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
    }

    // Tampoco aparece en la búsqueda.
    await page.goto("/acme/docs/introduccion")
    await page.getByRole("button", { name: "Buscar…" }).click()
    await page.getByPlaceholder("Buscar en la documentación…").fill("runbook")
    await expect(page.getByText("Sin resultados para «runbook».")).toBeVisible()
    await page.getByPlaceholder("Buscar en la documentación…").fill("autentic")
    await expect(page.getByRole("option", { name: /Autenticación/ })).toBeVisible()
  })

  test("lo ve y lo edita quien está en un grupo con permiso de edición", async ({ page }) => {
    await login(page, USERS.eva.email)
    await page.goto("/acme/interno")
    await expect(page).toHaveURL(/\/acme\/interno\/runbook$/)
    await expect(page.getByRole("link", { name: "Editar página" }).first()).toBeVisible()

    await page.goto(`/acme/interno/editar/${IDS.acmeRunbook}`)
    await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible()
  })
})
