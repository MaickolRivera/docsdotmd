import { expect, test } from "@playwright/test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { normalizeDirectiveFences } from "@/lib/markdown/normalize"
import { DocsMarkdown } from "@/lib/markdown/render"
import { getToc } from "@/lib/markdown/toc"

const render = (source: string) => renderToStaticMarkup(createElement(DocsMarkdown, { source }))

// Ejemplo de página de la especificación (sección 7).
const SPEC_EXAMPLE = `# Empieza en minutos

Haz tu primera llamada a la API en menos de 5 minutos.

:::steps
### Crea tu API key
Regístrate y genera una llave para pruebas.

:button[Registrarme]{href="/registro" variant="primary"}

### Haz tu primera petición
::::code-tabs
~~~js title="JavaScript"
const res = await client.messages.send({ message: "Hola" });
~~~
~~~python title="Python"
res = client.messages.send(message="Hola")
~~~
::::
:::

:::accordion{title="Recibo un error 401"}
Revisa que la llave esté en el encabezado Authorization.
:::
`

test.describe("normalizeDirectiveFences", () => {
  test("el contenedor de afuera recibe más dos puntos que el de adentro", () => {
    const out = normalizeDirectiveFences(SPEC_EXAMPLE).split("\n")
    expect(out).toContain("::::steps")
    expect(out).toContain(":::code-tabs")
    expect(out.filter((line) => line === "::::")).toHaveLength(1)
  })

  test("no toca los dos puntos dentro de bloques de código", () => {
    const source = "```md\n:::steps\n:::\n```\n"
    expect(normalizeDirectiveFences(source)).toBe(source)
  })

  test("anidar solo con ::: funciona", () => {
    const out = normalizeDirectiveFences(':::columns\n:::card{title="A"}\nx\n:::\n:::\n')
    expect(out).toBe('::::columns\n:::card{title="A"}\nx\n:::\n::::\n')
  })
})

test.describe("DocsMarkdown", () => {
  test("renderiza el ejemplo de la especificación con todos sus componentes", () => {
    const html = render(SPEC_EXAMPLE)
    expect(html).toContain('class="docs-steps"')
    expect(html.match(/class="docs-step"/g)).toHaveLength(2)
    expect(html).toContain('href="/registro"')
    expect(html).toContain("Registrarme")
    // Pestañas de código con los títulos del meta.
    expect(html).toContain('role="tablist"')
    expect(html).toContain(">JavaScript</button>")
    expect(html).toContain(">Python</button>")
    // Shiki resalta con colores en línea.
    expect(html).toMatch(/<pre[^>]*class="shiki"/)
    expect(html).toMatch(/style="color:#[0-9A-Fa-f]{6}/)
    // La línea de JavaScript se divide en varios tokens (const, res, =, await...).
    const jsLine =
      html.match(/data-language="js"[^>]*><code><span class="line">(.*?)<\/span><\/code>/)?.[1] ??
      ""
    expect(jsLine.match(/<span style=/g)?.length ?? 0).toBeGreaterThan(5)
    // Acordeón con su título.
    expect(html).toContain("Recibo un error 401")
    // Ninguna directiva quedó como texto.
    expect(html).not.toContain(":::")
  })

  test("no permite HTML crudo ni enlaces javascript:", () => {
    const html = render(
      [
        "<script>alert(1)</script>",
        '<img src="x" onerror="alert(1)">',
        "[clic](javascript:alert(1))",
        '<a href="javascript:alert(1)">a</a>',
        ':::callout{type="info" onclick="alert(1)" style="color:red"}',
        "texto",
        ":::",
        ':::card{title="X" href="javascript:alert(1)"}',
        "y",
        ":::",
      ].join("\n\n"),
    )
    expect(html).not.toContain("<script")
    expect(html).not.toContain("onerror")
    expect(html).not.toContain("onclick")
    expect(html.toLowerCase()).not.toContain("javascript:")
    expect(html).not.toMatch(/<img[^>]*src="x"/)
  })

  test("las directivas desconocidas se muestran como texto", () => {
    const html = render("Nota:importante\n\n:::desconocida{a=1}\nhola\n:::\n\n::otra\n")
    expect(html).toContain("Nota:importante")
    expect(html).toContain(":::desconocida{a=1}")
    expect(html).toContain("hola")
    expect(html).toContain("::otra")
  })

  test("convierte attachment:ID en la ruta que firma el enlace", () => {
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e"
    const html = render(
      `![diagrama](attachment:${id})\n\n[manual](attachment:${id})\n\n![x](attachment:no-es-uuid)`,
    )
    expect(html).toContain(`src="/api/adjuntos/${id}"`)
    expect(html).toContain(`href="/api/adjuntos/${id}"`)
    expect(html).not.toContain("attachment:")
  })

  test("aviso, tarjeta, botón y columnas", () => {
    const html = render(
      [
        ':::callout{type="warning" title="Cuidado"}',
        "Texto del aviso.",
        ":::",
        "",
        "::::columns",
        ':::card{title="Externa" icon="rocket" href="https://example.com"}',
        "Descripción",
        ":::",
        "",
        "***",
        "",
        ':button[Ir]{href="/acme/docs" variant="outline"}',
        "::::",
      ].join("\n"),
    )
    expect(html).toContain('role="note"')
    expect(html).toContain("Cuidado")
    expect(html.match(/class="docs-column"/g)).toHaveLength(2)
    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain('data-variant="outline"')
  })

  test("tablas y listas de tareas de GFM", () => {
    const html = render("| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] hecho\n- [ ] pendiente\n")
    expect(html).toContain("<table")
    expect(html).toContain('type="checkbox"')
  })

  test("bloque de código con título y lenguaje desconocido", () => {
    const html = render(
      '~~~ts title="cliente.ts"\nconst a: number = 1\n~~~\n\n~~~brainfuck\n+++\n~~~',
    )
    expect(html).toContain("cliente.ts")
    expect(html).toContain("+++")
  })
})

test.describe("getToc", () => {
  test("incluye h2/h3 con los mismos IDs que el renderizador y omite acordeones", () => {
    const source = `## Instalación\n\n:::steps\n### Paso uno\nx\n### Paso dos\ny\n:::\n\n:::accordion{title="Oculto"}\n## Dentro del acordeón\n:::\n\n## Errores comunes\n\n#### Muy profundo\n`
    const toc = getToc(source)
    expect(toc.map((item) => item.text)).toEqual([
      "Instalación",
      "Paso uno",
      "Paso dos",
      "Errores comunes",
    ])
    const html = render(source)
    for (const item of toc) expect(html).toContain(`id="${item.id}"`)
    expect(toc[0]).toEqual({ id: "instalación", text: "Instalación", depth: 2 })
  })
})

/** Profundidad máxima de <a> anidados en el HTML (1 = sin anidar). */
function maxAnchorDepth(html: string) {
  let depth = 0
  let max = 0
  for (const match of html.matchAll(/<a\b|<\/a>/g)) {
    depth += match[0] === "</a>" ? -1 : 1
    max = Math.max(max, depth)
  }
  return max
}

test.describe("Enlaces anidados", () => {
  test("una tarjeta con enlace y un botón adentro no anida <a>", () => {
    const html = render(
      [
        ':::card{title="Guía" icon="book" href="/acme/docs/guia"}',
        "Texto con [un enlace](/otra) y un botón:",
        "",
        ':button[Empezar]{href="/registro" variant="primary"}',
        ":::",
      ].join("\n"),
    )
    expect(html).toContain('href="/acme/docs/guia"')
    expect(html).toContain('href="/registro"')
    expect(html).toContain('href="/otra"')
    expect(maxAnchorDepth(html)).toBe(1)
  })

  test("un botón dentro de un enlace de markdown queda como texto", () => {
    const html = render('[Ir a :button[Botón]{href="/x"} ahora](/destino)')
    expect(html).toContain('href="/destino"')
    expect(html).toContain("Botón")
    expect(html).not.toContain('href="/x"')
    expect(maxAnchorDepth(html)).toBe(1)
  })

  test("una tarjeta externa sin título sigue siendo accesible", () => {
    const html = render(':::card{icon="globe" href="https://example.com"}\nSitio externo\n:::')
    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain("Abrir enlace")
  })
})

test.describe("Iconos de las tarjetas", () => {
  test("acepta nombres, alias y usa un icono por defecto si no existe", () => {
    expect(render(':::card{title="A" icon="book"}\nx\n:::')).toContain("lucide-book")
    expect(render(':::card{title="A" icon="home"}\nx\n:::')).toContain("lucide-house")
    expect(render(':::card{title="A" icon="Rocket"}\nx\n:::')).toContain("lucide-rocket")
    expect(render(':::card{title="A" icon="no-existe"}\nx\n:::')).toContain("lucide-file-text")
  })
})
