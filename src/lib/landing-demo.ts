import type { IconName } from "@/lib/icons"

// Contenido de la demo de la landing: una organización ficticia ("Acme") con
// espacios y páginas escritas con los mismos componentes que la app. Los
// enlaces `#demo-<id>` abren otra página dentro de la demo.

export type DemoSpace = {
  id: string
  name: string
  icon: IconName
}

export type DemoPage = {
  id: string
  spaceId: string
  /** Página padre en la barra lateral (por ejemplo, Guías). */
  parentId?: string
  title: string
  draft?: boolean
  source: string
}

export const DEMO_LINK_PREFIX = "#demo-"

export const DEMO_SPACES: DemoSpace[] = [
  { id: "docs", name: "Documentación", icon: "book-open" },
  { id: "api", name: "API Reference", icon: "code" },
  { id: "changelog", name: "Changelog", icon: "history" },
  { id: "interno", name: "Interno", icon: "lock" },
]

export const DEMO_PAGES: DemoPage[] = [
  {
    id: "introduccion",
    spaceId: "docs",
    title: "Introducción",
    source: `Bienvenido a la documentación de **Acme Pagos**, la API para cobrar en línea en minutos.

::::columns
:::card{title="Empieza en minutos" icon="rocket" href="#demo-empieza-en-minutos"}
Haz tu primera petición en menos de 5 minutos.
:::

***

:::card{title="Autenticación" icon="key-round" href="#demo-autenticacion"}
Cómo enviar tu llave en cada petición.
:::
::::

:::callout{type="info" title="Ambiente de pruebas"}
Usa una llave \`sk_test_\` para probar sin mover dinero real.
:::

## ¿Qué puedes hacer con Acme Pagos?

- Cobrar con tarjeta, transferencia y billeteras digitales.
- Crear enlaces de pago para compartir por chat o correo.
- Recibir notificaciones automáticas con webhooks.`,
  },
  {
    id: "empieza-en-minutos",
    spaceId: "docs",
    title: "Empieza en minutos",
    source: `Haz tu primera llamada a la API en menos de 5 minutos.

:::steps
### Crea tu API key
Regístrate y genera una llave para pruebas.

### Haz tu primera petición
::::code-tabs
~~~js title="JavaScript"
const pago = await acme.pagos.crear({ monto: 25000, moneda: "COP" })
~~~
~~~python title="Python"
pago = acme.pagos.crear(monto=25000, moneda="COP")
~~~
~~~bash title="cURL"
curl https://api.acme.test/v1/pagos -d monto=25000 -d moneda=COP
~~~
::::

### Revisa la respuesta
Si todo salió bien recibirás un pago con estado \`aprobado\`.
:::

:::accordion{title="Recibo un error 401"}
Revisa que la llave esté en el encabezado \`Authorization\`.
:::`,
  },
  {
    id: "guias",
    spaceId: "docs",
    title: "Guías",
    source: `Guías paso a paso para integrar Acme Pagos.

:::card{title="Instalación" icon="download" href="#demo-instalacion"}
Instala el SDK oficial para JavaScript o Python.
:::

:::card{title="Autenticación" icon="key-round" href="#demo-autenticacion"}
Cómo enviar tu llave y qué hacer si se filtra.
:::`,
  },
  {
    id: "instalacion",
    spaceId: "docs",
    parentId: "guias",
    title: "Instalación",
    source: `Instala el SDK oficial con tu gestor de paquetes favorito.

::::code-tabs
~~~bash title="npm"
npm install @acme/pagos
~~~
~~~bash title="pip"
pip install acme-pagos
~~~
::::

:::callout{type="tip" title="Requisitos"}
Node.js 20 o superior, o Python 3.10 o superior.
:::`,
  },
  {
    id: "autenticacion",
    spaceId: "docs",
    parentId: "guias",
    title: "Autenticación",
    source: `Cada petición lleva tu llave en el encabezado \`Authorization\`.

~~~bash title="Terminal"
curl https://api.acme.test/v1/pagos -H "Authorization: Bearer $ACME_API_KEY"
~~~

:::callout{type="warning" title="Nunca expongas tu llave"}
Guárdala en variables de entorno, nunca en el código que corre en el navegador.
:::`,
  },
  {
    id: "hoja-de-ruta",
    spaceId: "docs",
    title: "Hoja de ruta",
    draft: true,
    source: `Lo que viene en los próximos meses.

- [x] Enlaces de pago con vencimiento
- [ ] Pagos recurrentes
- [ ] Reportes descargables`,
  },
  {
    id: "crear-un-pago",
    spaceId: "api",
    title: "Crear un pago",
    source: `\`POST /v1/pagos\` crea un cobro y devuelve su estado.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| \`monto\` | entero | Valor en la moneda indicada |
| \`moneda\` | texto | Código ISO, por ejemplo \`COP\` |
| \`descripcion\` | texto | Opcional, aparece en el recibo |

~~~json title="Respuesta 201"
{
  "id": "pay_8f2k1",
  "estado": "aprobado",
  "monto": 25000
}
~~~`,
  },
  {
    id: "webhooks",
    spaceId: "api",
    title: "Webhooks",
    source: `Recibe un \`POST\` en tu servidor cada vez que cambia el estado de un pago.

:::steps
### Registra la URL
En **Ajustes → Webhooks**, agrega la dirección de tu servidor.

### Verifica la firma
Compara el encabezado \`Acme-Signature\` con tu secreto antes de procesar el evento.
:::`,
  },
  {
    id: "octubre-2026",
    spaceId: "changelog",
    title: "Octubre 2026",
    source: `:::callout{type="tip" title="Versión 1.4"}
Enlaces de pago con vencimiento y nuevos eventos de webhook.
:::

- **Nuevo:** campo \`expira_en\` en los enlaces de pago.
- **Mejora:** los webhooks se reintentan durante 24 horas.
- **Corrección:** el recibo muestra la moneda correcta.`,
  },
  {
    id: "runbook",
    spaceId: "interno",
    title: "Runbook de incidentes",
    source: `:::callout{type="danger" title="Espacio restringido"}
Solo lo ve el grupo **Ingeniería**. El resto de la organización no lo encuentra ni en la búsqueda.
:::

:::steps
### Declara el incidente
Avisa en el canal de guardia y asigna a una persona responsable.

### Mitiga primero
Si el error empezó después de un despliegue, reviértelo antes de investigar.
:::`,
  },
]
