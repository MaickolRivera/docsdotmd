import type { TocItem } from "@/lib/markdown/toc"

// Contenido de la guía pública (/guia).

export type GuideExample = {
  /** Ancla del título (`/guia#pasos`). */
  id: string
  title: string
  /** Explicación corta, en markdown. */
  description: string
  /** Markdown del ejemplo: se muestra renderizado y tal cual. */
  source: string
  /** false si el resultado no se puede mostrar fuera de una organización (adjuntos). */
  preview?: boolean
}

export type GuideSection = {
  id: string
  title: string
  intro?: string
  examples: GuideExample[]
}

export const GUIDE_PROCESS = {
  id: "documenta-un-proceso",
  title: "Documenta un proceso",
  source: `Esta sección es un proceso documentado de verdad: explica cómo documentar un proceso y está escrita con los mismos componentes que se describen más abajo.

:::steps
### Crea la página en el espacio de tu organización
En la barra lateral del espacio, usa **+ Página**.

### Explica el objetivo y lo que se necesita
Documenta el proceso con markdown y mejora la experiencia usando nuestros componentes.
Empieza con el para qué sirve el proceso, quién lo hace y qué hace falta antes de empezar.

:::callout{type="info" title="Procesos internos"}
Si solo debe verlo un equipo, crea la página en un espacio restringido: solo la verán los grupos con acceso (y los admins), también en la búsqueda.
:::

### Señala los riesgos
Usa avisos \`warning\` o \`danger\` para lo que no se puede deshacer, y acordeones para las preguntas frecuentes.

### Publica y comparte
Cambia el estado a **Publicado** y guarda con \`Ctrl + S\`. Comparte el enlace: solo lo abre quien tiene acceso al espacio.
:::

:::callout{type="tip" title="No memorices la sintaxis"}
En el editor escribe \`/\` al inicio de una línea, o usa **Insertar componente**, para agregar cualquier bloque con una plantilla lista para completar.
:::`,
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "markdown-basico",
    title: "Markdown básico",
    intro:
      "Además de los componentes funciona todo el markdown de siempre. Por seguridad no se admite HTML, y los enlaces solo pueden ir a rutas de la app, a direcciones `http(s)` o a `mailto:`.",
    examples: [
      {
        id: "texto-listas-y-tablas",
        title: "Texto, listas y tablas",
        description:
          "Títulos `##` y `###` (aparecen en «En esta página»), negrita, cursiva, enlaces, listas, tareas, tablas y citas.",
        source: `**Negrita**, _cursiva_, \`código\` y [enlaces](#iconos).

1. Lista numerada
2. Con varios elementos

- [x] Tarea hecha
- [ ] Tarea pendiente

| Rol    | Puede editar |
| ------ | ------------ |
| Editor | Sí           |
| Lector | No           |

> Una cita para destacar una idea.`,
      },
      {
        id: "imagenes-y-archivos",
        title: "Imágenes y archivos",
        description:
          "Pega o arrastra un archivo en el editor (imágenes, PDF o texto de hasta 4 MB), o usa **Adjuntar archivo**: se sube y el enlace se inserta solo. Los adjuntos son privados: solo los abre quien tiene acceso a la página.",
        source: `![Diagrama de arquitectura](attachment:3f0c2a8e-1b7d-4c55-9a51-6c1f0e9d2b44)

[Manual de operación (PDF)](attachment:8a6d4e1f-2c3b-4d5e-8f70-1a2b3c4d5e6f)`,
        preview: false,
      },
    ],
  },
  {
    id: "componentes",
    title: "Componentes",
    intro: `Los componentes son bloques que empiezan con \`:::nombre\` y terminan con \`:::\` (también valen más dos puntos, como \`::::\`). Se pueden anidar, por ejemplo un aviso dentro de un paso o tarjetas dentro de columnas, sin contar los dos puntos: DOCSdotmd ajusta los contenedores por ti.`,
    examples: [
      {
        id: "pasos",
        title: "Pasos",
        description:
          "Para procesos y tutoriales. Cada título `###` dentro del bloque es un paso numerado; lo que va debajo, hasta el siguiente `###`, es su contenido.",
        source: `:::steps
### Instala las dependencias
Ejecuta \`pnpm install\` en la raíz del proyecto.

### Configura las variables
Copia \`.env.example\` como \`.env.local\` y completa los valores.
:::`,
      },
      {
        id: "avisos",
        title: "Avisos",
        description:
          "Destacan lo importante. Hay cuatro tipos: `info`, `tip`, `warning` y `danger`; el título es opcional.",
        source: `:::callout{type="info" title="Nota"}
Las páginas en borrador solo las ven quienes pueden editar el espacio.
:::

:::callout{type="tip"}
Usa Ctrl + K para buscar en toda la documentación.
:::

:::callout{type="warning" title="Antes de borrar"}
Borrar una página también borra sus subpáginas.
:::

:::callout{type="danger" title="Irreversible"}
Borrar la organización elimina todo su contenido.
:::`,
      },
      {
        id: "acordeon",
        title: "Acordeón",
        description:
          "Contenido que se despliega al hacer clic, ideal para preguntas frecuentes. Los títulos que van dentro no aparecen en «En esta página».",
        source: `:::accordion{title="¿Quién puede ver esta página?"}
Los miembros con acceso al espacio. Si el espacio es restringido, solo los grupos elegidos, los admins y los owners.
:::

:::accordion{title="¿Se puede recuperar una página borrada?"}
No. Si crees que la vas a necesitar, déjala en borrador en lugar de borrarla.
:::`,
      },
      {
        id: "tarjetas",
        title: "Tarjetas",
        description:
          "Un icono, un título y un texto corto. Con `href` toda la tarjeta es un enlace: a otra página (su ruta, como `/acme/docs/instalacion`), a una sección (`#iconos`) o a un sitio externo. El icono se elige de la [lista de iconos](#iconos).",
        source: `:::card{title="Lista de iconos" icon="sparkles" href="#iconos"}
Todos los nombres que puedes usar en una tarjeta.
:::

:::card{title="Guía de Markdown" icon="book-open" href="https://www.markdownguide.org/basic-syntax/"}
Los enlaces externos se abren en otra pestaña.
:::`,
      },
      {
        id: "botones",
        title: "Botones",
        description:
          "Un enlace con forma de botón, dentro del texto o solo en su línea. Variantes: `primary`, `secondary`, `outline` y `ghost`.",
        source: `:button[Primario]{href="#botones" variant="primary"}
:button[Secundario]{href="#botones" variant="secondary"}
:button[Contorno]{href="#botones" variant="outline"}
:button[Fantasma]{href="#botones" variant="ghost"}`,
      },
      {
        id: "columnas",
        title: "Columnas",
        description:
          "Contenido lado a lado; separa las columnas con `***`. En pantallas pequeñas se apilan.",
        source: `::::columns
:::card{title="Para lectores" icon="eye"}
Encuentran cualquier página con Ctrl + K.
:::

***

:::card{title="Para editores" icon="pencil"}
Escriben en markdown con vista previa en vivo.
:::
::::`,
      },
      {
        id: "bloques-de-codigo",
        title: "Bloques de código",
        description:
          "Escribe el código entre dos líneas `~~~` (o tres comillas invertidas) e indica el lenguaje para resaltarlo. Con `title` el bloque muestra un nombre; todos tienen botón para copiar.",
        source: `~~~ts title="src/config.ts"
export const config = {
  region: "us-east-1",
  reintentos: 3,
}
~~~`,
      },
      {
        id: "pestanas-de-codigo",
        title: "Pestañas de código",
        description:
          "El mismo ejemplo en varios lenguajes: cada bloque de código es una pestaña. Su nombre sale de `title` o, si no lo tiene, del lenguaje.",
        source: `::::code-tabs
~~~js title="JavaScript"
const res = await fetch("https://api.ejemplo.com/pedidos")
~~~
~~~python title="Python"
res = requests.get("https://api.ejemplo.com/pedidos")
~~~
~~~bash
curl https://api.ejemplo.com/pedidos
~~~
::::`,
      },
    ],
  },
]

export const GUIDE_ICONS = {
  id: "iconos",
  title: "Iconos",
  intro: `Los iconos se usan en el atributo \`icon\` de las **tarjetas** y en el icono de cada **espacio** (Ajustes → Espacios). Escribir el nombre de un icono en otra parte del texto no lo convierte en icono.

~~~md title="Markdown"
:::card{title="Despliegues" icon="rocket" href="/acme/docs/despliegues"}
Cómo publicar una versión nueva.
:::
~~~

Haz clic en un icono para copiar su nombre. En el editor, al escribir \`icon="\` aparecen sugerencias, y también se aceptan algunos alias en español e inglés (\`home\`, \`ajustes\`, \`pago\`…). Si el nombre no existe se muestra un icono por defecto y el editor te avisa.`,
}

/** "En esta página" de la guía: secciones (h2) y ejemplos (h3). */
export const GUIDE_TOC: TocItem[] = [
  { id: GUIDE_PROCESS.id, text: GUIDE_PROCESS.title, depth: 2 },
  ...GUIDE_SECTIONS.flatMap((section): TocItem[] => [
    { id: section.id, text: section.title, depth: 2 },
    ...section.examples.map((example): TocItem => ({
      id: example.id,
      text: example.title,
      depth: 3,
    })),
  ]),
  { id: GUIDE_ICONS.id, text: GUIDE_ICONS.title, depth: 2 },
]

/** Bloque de código que muestra un markdown tal cual (con una cerca más larga que las suyas). */
export function toCodeBlock(source: string, title = "Markdown"): string {
  const fences = Array.from(source.matchAll(/^ {0,3}(`{3,})/gm), (match) => match[1].length)
  const fence = "`".repeat(Math.max(2, ...fences) + 1)
  return `${fence}md title="${title}"\n${source}\n${fence}`
}
