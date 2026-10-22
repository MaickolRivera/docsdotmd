-- Datos ficticios para desarrollo y pruebas (solo para `supabase db reset`).
--
-- Usuarios (contraseña de todos: Demo-DOCSmd-2026, no se usa en ningún otro lado):
--   ana@acme.test     owner de Acme
--   eva@acme.test     editora de Acme, integrante del grupo "Ingeniería"
--   leo@acme.test     lector de Acme
--   gina@globex.test  owner de Globex, integrante del grupo "Finanzas"
--
-- Acme:   Documentación (toda la org), API Reference, Changelog
--         e Interno (restringido al grupo Ingeniería con permiso de edición).
-- Globex: Documentación (toda la org) y Finanzas (restringido al grupo Finanzas).

-- ---------------------------------------------------------------------------
-- Usuarios de Auth (el trigger on_auth_user_created crea sus perfiles)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  u.id::uuid,
  'authenticated',
  'authenticated',
  u.email,
  extensions.crypt('Demo-DOCSmd-2026', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name),
  now(),
  now(),
  '', '', '', '', ''
from (values
  ('11111111-1111-4111-8111-111111111111', 'ana@acme.test', 'Ana Martínez'),
  ('22222222-2222-4222-8222-222222222222', 'leo@acme.test', 'Leo Gómez'),
  ('33333333-3333-4333-8333-333333333333', 'gina@globex.test', 'Gina Rojas'),
  ('44444444-4444-4444-8444-444444444444', 'eva@acme.test', 'Eva Torres')
) as u (id, email, full_name);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email like '%.test';

-- ---------------------------------------------------------------------------
-- Organizaciones, miembros y grupos
-- ---------------------------------------------------------------------------
insert into public.organizations (id, name, slug, created_by) values
  ('a0000000-0000-4000-8000-000000000001', 'Acme', 'acme', '11111111-1111-4111-8111-111111111111'),
  ('b0000000-0000-4000-8000-000000000001', 'Globex', 'globex', '33333333-3333-4333-8333-333333333333');

insert into public.members (org_id, user_id, role) values
  ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'owner'),
  ('a0000000-0000-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444', 'editor'),
  ('a0000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'viewer'),
  ('b0000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'owner');

insert into public.groups (id, org_id, name) values
  ('a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Ingeniería'),
  ('b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Finanzas');

insert into public.group_members (group_id, user_id, org_id) values
  ('a2000000-0000-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444', 'a0000000-0000-4000-8000-000000000001'),
  ('b2000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'b0000000-0000-4000-8000-000000000001');

-- ---------------------------------------------------------------------------
-- Espacios
-- ---------------------------------------------------------------------------
insert into public.spaces (id, org_id, name, slug, icon, visibility, position) values
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Documentación', 'docs', 'book-open', 'org', 0),
  ('a1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'API Reference', 'api', 'code', 'org', 1),
  ('a1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Changelog', 'changelog', 'history', 'org', 2),
  ('a1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Interno', 'interno', 'lock', 'restricted', 3),
  ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Documentación', 'docs', 'book-open', 'org', 0),
  ('b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Finanzas', 'finanzas', 'landmark', 'restricted', 1);

insert into public.space_groups (space_id, group_id, org_id, permission) values
  ('a1000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'edit'),
  ('b1000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'read');

-- ---------------------------------------------------------------------------
-- Páginas de Acme · Documentación
-- ---------------------------------------------------------------------------
insert into public.pages (id, org_id, space_id, parent_id, title, slug, status, position, created_by, updated_by, content_md) values
(
  'a3000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', null,
  'Introducción', 'introduccion', 'published', 0,
  '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  $md$Bienvenido a la documentación de **Acme Pagos**, la API para cobrar en línea en minutos.

::::columns
:::card{title="Empieza en minutos" icon="rocket" href="/acme/docs/empieza-en-minutos"}
Crea tu llave y haz tu primera petición en menos de 5 minutos.
:::

:::card{title="Instalación" icon="package" href="/acme/docs/guias/instalacion"}
Instala el SDK oficial para JavaScript o Python.
:::

:::card{title="Autenticación" icon="key-round" href="/acme/docs/guias/autenticacion"}
Cómo enviar tu llave y proteger tus credenciales.
:::

:::card{title="Referencia de la API" icon="code" href="/acme/api"}
Todos los endpoints, parámetros y respuestas.
:::
::::

## ¿Qué puedes hacer con Acme Pagos?

- Cobrar con tarjeta, transferencia y billeteras digitales.
- Crear enlaces de pago que puedes compartir por chat o correo.
- Recibir notificaciones automáticas con webhooks.

:::callout{type="info" title="Ambiente de pruebas"}
Todas las cuentas nuevas empiezan en modo de pruebas. No se mueve dinero real hasta que actives tu cuenta.
:::

## Conceptos clave

| Concepto | Descripción |
| --- | --- |
| Cobro | Intento de mover dinero desde tu cliente hacia tu cuenta. |
| Cliente | Persona o empresa a la que le cobras. |
| Webhook | Aviso que enviamos a tu servidor cuando algo cambia. |
$md$
),
(
  'a3000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', null,
  'Empieza en minutos', 'empieza-en-minutos', 'published', 1,
  '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444',
  $md$# Empieza en minutos

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
~~~bash title="cURL"
curl https://api.acme.test/v1/messages \
  -H "Authorization: Bearer $ACME_API_KEY" \
  -d message="Hola"
~~~
::::

### Revisa la respuesta
Si todo salió bien recibirás un objeto con el estado `sent`.
:::

:::accordion{title="Recibo un error 401"}
Revisa que la llave esté en el encabezado Authorization.
:::

:::accordion{title="¿Cuánto cuesta el ambiente de pruebas?"}
Nada. Puedes hacer todas las peticiones que quieras mientras desarrollas.
:::
$md$
),
(
  'a3000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', null,
  'Guías', 'guias', 'published', 2,
  '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  $md$Guías paso a paso para integrar Acme Pagos en tu aplicación.

::::columns
:::card{title="Instalación" icon="package" href="/acme/docs/guias/instalacion"}
SDK para JavaScript y Python.
:::

:::card{title="Autenticación" icon="key-round" href="/acme/docs/guias/autenticacion"}
Llaves, encabezados y buenas prácticas.
:::
::::
$md$
),
(
  'a3000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000003',
  'Instalación', 'instalacion', 'published', 0,
  '44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444',
  $md$Instala el SDK oficial con tu gestor de paquetes favorito.

## Requisitos

- Node.js 20 o superior, o Python 3.10 o superior.
- Una llave de pruebas (empieza por `sk_test_`).

## Instala el paquete

::::code-tabs
~~~bash title="pnpm"
pnpm add @acme/pagos
~~~
~~~bash title="npm"
npm install @acme/pagos
~~~
~~~bash title="pip"
pip install acme-pagos
~~~
::::

## Configura el cliente

:::steps
### Guarda tu llave en una variable de entorno
~~~bash
export ACME_API_KEY="sk_test_123"
~~~

### Crea el cliente
~~~ts title="cliente.ts"
import { Acme } from "@acme/pagos";

export const client = new Acme({ apiKey: process.env.ACME_API_KEY });
~~~
:::

:::callout{type="warning" title="Nunca publiques tu llave"}
No subas archivos `.env` a tu repositorio ni uses la llave en el navegador.
:::

:::callout{type="danger" title="Llaves de producción"}
Las llaves que empiezan por `sk_live_` mueven dinero real. Guárdalas en un gestor de secretos.
:::
$md$
),
(
  'a3000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000003',
  'Autenticación', 'autenticacion', 'published', 1,
  '44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444',
  $md$Todas las peticiones a la API se autentican con tu llave secreta en el encabezado `Authorization`.

## Envía la llave

::::code-tabs
~~~bash title="cURL"
curl https://api.acme.test/v1/charges \
  -H "Authorization: Bearer $ACME_API_KEY"
~~~
~~~js title="JavaScript"
const res = await fetch("https://api.acme.test/v1/charges", {
  headers: { Authorization: `Bearer ${process.env.ACME_API_KEY}` },
});
~~~
~~~python title="Python"
import os, requests

res = requests.get(
    "https://api.acme.test/v1/charges",
    headers={"Authorization": f"Bearer {os.environ['ACME_API_KEY']}"},
)
~~~
::::

:::callout{type="tip" title="Rota tus llaves"}
Puedes tener dos llaves activas al mismo tiempo para cambiarlas sin cortar el servicio.
:::

## Errores comunes

:::accordion{title="401 Unauthorized"}
La llave no llegó o no es válida. Revisa que el encabezado empiece por `Bearer `.
:::

:::accordion{title="403 Forbidden"}
La llave es válida pero no tiene permiso para ese recurso.
:::
$md$
),
(
  'a3000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', null,
  'Hoja de ruta', 'hoja-de-ruta', 'draft', 3,
  '44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444',
  $md$:::callout{type="warning" title="Borrador"}
Esta página aún no se publica: solo la ven quienes pueden editar el espacio.
:::

- [x] Cobros con tarjeta
- [x] Enlaces de pago
- [ ] Suscripciones
- [ ] Facturación electrónica
$md$
);

-- ---------------------------------------------------------------------------
-- Páginas de Acme · API Reference, Changelog e Interno
-- ---------------------------------------------------------------------------
insert into public.pages (id, org_id, space_id, parent_id, title, slug, status, position, created_by, updated_by, content_md) values
(
  'a3000000-0000-4000-8000-000000000011',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', null,
  'Referencia de la API', 'referencia', 'published', 0,
  '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  $md$La API usa JSON y códigos HTTP estándar. La URL base es `https://api.acme.test/v1`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/charges` | Lista los cobros |
| `POST` | `/charges` | Crea un cobro |
| `GET` | `/charges/{id}` | Obtiene un cobro |
| `POST` | `/refunds` | Reembolsa un cobro |

## Crear un cobro

::::code-tabs
~~~bash title="cURL"
curl -X POST https://api.acme.test/v1/charges \
  -H "Authorization: Bearer $ACME_API_KEY" \
  -d amount=50000 -d currency=cop
~~~
~~~json title="Respuesta"
{
  "id": "ch_123",
  "amount": 50000,
  "currency": "cop",
  "status": "succeeded"
}
~~~
::::
$md$
),
(
  'a3000000-0000-4000-8000-000000000021',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', null,
  'Novedades', 'novedades', 'published', 0,
  '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111',
  $md$## Octubre 2026

- Nuevos enlaces de pago con fecha de vencimiento.
- Los webhooks ahora se reintentan durante 72 horas.

## Septiembre 2026

:::callout{type="info" title="Cambio en la API"}
El campo `source` de los cobros pasa a llamarse `payment_method`. El nombre anterior seguirá funcionando hasta enero.
:::
$md$
),
(
  'a3000000-0000-4000-8000-000000000031',
  'a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', null,
  'Runbook de guardias', 'runbook', 'published', 0,
  '44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444',
  $md$Procedimiento interno para el equipo de Ingeniería. Solo lo ve el grupo **Ingeniería**, además de owners y admins.

:::steps
### Confirma la alerta
Revisa el tablero de errores y confirma que no sea un falso positivo.

### Avisa en el canal de incidentes
Publica un resumen corto con el impacto y la hora de inicio.

### Mitiga
Si el problema empezó con un despliegue, revierte primero y analiza después.
:::

:::callout{type="danger" title="Datos de clientes"}
Nunca copies datos de clientes en el canal de incidentes.
:::
$md$
);

-- ---------------------------------------------------------------------------
-- Páginas de Globex
-- ---------------------------------------------------------------------------
insert into public.pages (id, org_id, space_id, parent_id, title, slug, status, position, created_by, updated_by, content_md) values
(
  'b3000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', null,
  'Bienvenida a Globex', 'bienvenida', 'published', 0,
  '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333',
  $md$::::columns
## Todo lo que necesitas para tu primer día

Aquí encuentras el manual de marca, las herramientas y las respuestas a las preguntas más comunes.

:button[Ver manual de marca]{href="/globex/docs/manual-de-marca" variant="primary"}

***

:::steps
### Activa tu cuenta
Revisa tu correo y crea tu contraseña.

### Lee el manual de marca
Conoce nuestros colores, tipografías y tono.

### Pregunta sin miedo
Revisa las preguntas frecuentes o escribe al canal de bienvenida.
:::
::::
$md$
),
(
  'b3000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', null,
  'Manual de marca', 'manual-de-marca', 'published', 1,
  '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333',
  $md$## Colores

| Nombre | Hex |
| --- | --- |
| Azul Globex | `#2F6FE4` |
| Grafito | `#18181B` |

## Úsalos en código

::::code-tabs
~~~css title="CSS"
:root {
  --globex-blue: #2f6fe4;
}
~~~
~~~html title="HTML"
<button class="bg-globex">Comprar</button>
~~~
::::

:::callout{type="tip" title="Contraste"}
Usa texto blanco sobre el azul Globex para cumplir con el contraste mínimo.
:::

:::card{title="Descargar logos" icon="download" href="https://example.com"}
Paquete con el logo en SVG y PNG.
:::
$md$
),
(
  'b3000000-0000-4000-8000-000000000003',
  'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', null,
  'Preguntas frecuentes', 'preguntas-frecuentes', 'published', 2,
  '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333',
  $md$:::accordion{title="¿Dónde pido acceso a una herramienta?"}
Escribe a mesa de ayuda con el nombre de la herramienta y tu rol.
:::

:::accordion{title="¿Cada cuánto se actualiza este manual?"}
Cada vez que cambia algo. Revisa la fecha de actualización al final de cada página.
:::

:::callout{type="info" title="¿No encuentras tu pregunta?"}
Usa el buscador con **Ctrl + K**.
:::
$md$
),
(
  'b3000000-0000-4000-8000-000000000011',
  'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', null,
  'Presupuesto 2027', 'presupuesto-2027', 'published', 0,
  '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333',
  $md$Documento confidencial del grupo **Finanzas**.

| Área | Presupuesto |
| --- | --- |
| Marketing | 120.000 |
| Producto | 340.000 |

:::callout{type="warning" title="Confidencial"}
No compartas estas cifras fuera del grupo.
:::
$md$
);
