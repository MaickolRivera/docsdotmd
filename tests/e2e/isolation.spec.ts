import { expect, test } from "@playwright/test"

import { IDS, login, supabaseAs, USERS } from "./helpers"

// Prueba de aislamiento: un usuario de la organización A no ve páginas,
// espacios, miembros ni archivos de la organización B, ni cambiando URLs o IDs.

test.describe("Aislamiento entre Acme y Globex", () => {
  test("Gina (Globex) recibe 404 en todo lo de Acme", async ({ page }) => {
    await login(page, USERS.gina.email)
    for (const path of [
      "/acme",
      "/acme/docs",
      "/acme/docs/introduccion",
      "/acme/interno",
      "/acme/ajustes",
      `/acme/docs/editar/${IDS.acmeIntroduccion}`,
      // IDs de Acme con el slug de Globex tampoco sirven.
      `/globex/docs/editar/${IDS.acmeIntroduccion}`,
      `/api/adjuntos/${IDS.acmeIntroduccion}`,
    ]) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
    }
    // Lo suyo sí lo ve.
    const own = await page.goto("/globex/docs/bienvenida")
    expect(own?.status()).toBe(200)
  })

  test("RLS no devuelve nada de Acme a Gina aunque consulte la API", async () => {
    const gina = await supabaseAs(USERS.gina.email)

    const { data: orgs } = await gina.from("organizations").select("slug")
    expect(orgs?.map((org) => org.slug)).toEqual(["globex"])

    for (const table of [
      "spaces",
      "pages",
      "members",
      "groups",
      "group_members",
      "space_groups",
      "invitations",
      "attachments",
    ] as const) {
      const { data, error } = await gina.from(table).select("org_id").eq("org_id", IDS.acme)
      expect(error, table).toBeNull()
      expect(data, table).toEqual([])
    }

    const { data: profiles } = await gina.from("profiles").select("email")
    expect(profiles?.map((profile) => profile.email)).toEqual([USERS.gina.email])

    const { data: results } = await gina.rpc("search_pages", { p_org: IDS.acme, p_query: "pagos" })
    expect(results).toEqual([])

    const { data: files } = await gina.storage.from("attachments").list(IDS.acme)
    expect(files ?? []).toEqual([])

    const { data: updated } = await gina
      .from("organizations")
      .update({ name: "Tomada" })
      .eq("id", IDS.acme)
      .select("id")
    expect(updated ?? []).toEqual([])
  })

  test("y al revés: Ana (Acme) no ve Globex", async ({ page }) => {
    await login(page, USERS.ana.email)
    for (const path of [
      "/globex",
      "/globex/docs/bienvenida",
      "/globex/finanzas",
      "/globex/ajustes",
    ]) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
    }
    const ana = await supabaseAs(USERS.ana.email)
    const { data } = await ana.from("pages").select("id").eq("id", IDS.globexBienvenida)
    expect(data).toEqual([])
  })
})
