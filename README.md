# DOCSdotmd

Plataforma de documentación privada y modular. Con un editor en Markdown enriquecido con componentes visuales interactivos. Organiza el conocimiento por espacios y páginas con acceso estrictamente privado, respaldado por una arquitectura de seguridad robusta con Row-Level Security (RLS).

🌐 **Demo en vivo:** [docsdotmd.vercel.app](https://docsdotmd.vercel.app)

![Vista previa de DOCSdotmd](public/docsdotmd_preview.webp)

---

## Características

- **Organizaciones y espacios**: cada organización agrupa su documentación en espacios (pestañas), con visibilidad para toda la organización o solo para ciertos grupos.
- **Roles y permisos** (owner, admin, editor, lector) aplicados en la base de datos con Row Level Security: un acceso no autorizado responde **404 real**.
- **Editor markdown** con vista previa en vivo, inserción de componentes con `/` y borradores locales.
- **Componentes visuales**: pasos, pestañas de código, avisos, acordeones, tarjetas, botones y columnas.
- **Búsqueda instantánea** de texto completo (`Ctrl + K`) que respeta los permisos de cada usuario.
- **Archivos privados**: imágenes y PDF servidos con enlaces firmados que caducan en 60 segundos.
- **Invitaciones** por correo con enlaces de un solo uso y vencimiento.
- **Guía pública** en `/guia` con cada componente, su markdown, su resultado y todos los iconos.
- Interfaz responsive, con tema claro y oscuro.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) estricto
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + typography
- [Supabase](https://supabase.com/): Auth, Postgres con RLS y Storage privado, con `@supabase/ssr`
- react-markdown + remark-gfm + remark-directive + rehype-sanitize + rehype-slug
- [Shiki](https://shiki.style/) (resaltado) y [CodeMirror 6](https://codemirror.net/) (editor)
- [Zod](https://zod.dev/) + react-hook-form, [cmdk](https://cmdk.paco.me/)
- [Playwright](https://playwright.dev/) para pruebas unitarias del renderizador y e2e
- Gestor de paquetes: [pnpm](https://pnpm.io/)

## Como empezar

### Instalación

```bash
git clone https://github.com/MaickolRivera/docsdotmd.git
cd docsdotmd
pnpm install
```

### Configuración

1. Base de datos (elige una):
   - **Local (Docker):** `pnpm db:start` y luego `pnpm db:reset` (aplica `supabase/migrations` y `supabase/seed.sql`).
   - **Nube:** crea un proyecto en Supabase, `pnpm supabase login`, `pnpm supabase link --project-ref <ref>` y `pnpm db:push` (agrega `--include-seed` para los datos de demo).
2. Copia `.env.example` como `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL`.
3. En Supabase → Auth → URL Configuration agrega `http://localhost:3000/**` y la URL de producción. Pega las plantillas de `supabase/templates/` en Auth → Email Templates (usan `token_hash`, funcionan aunque el enlace se abra en otro navegador). Para más correos configura un SMTP gratuito (Resend).
4. `pnpm dev` y entra en http://localhost:3000
5. Regenera los tipos tras cada migración: `pnpm db:types` (local) o `pnpm db:types:linked`.

### Scripts disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Compila para producción
pnpm lint         # ESLint
pnpm typecheck    # Tipos de Next.js + TypeScript
pnpm test:unit    # Pruebas del renderizador de markdown
pnpm test:e2e     # Pruebas e2e (requieren Supabase local; en CI corren con supabase start)
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (marketing)/   # Landing, guía pública, privacidad y términos
│   ├── (auth)/        # Login, registro y recuperación de contraseña
│   ├── (app)/         # Organizaciones, espacios, páginas, editor y ajustes
│   ├── api/adjuntos/  # Entrega de adjuntos con enlaces firmados
│   └── auth/callback/ # Destino de los enlaces de los correos
├── actions/           # Server Actions (auth, orgs, espacios, páginas, miembros...)
├── components/        # UI: docs, editor, layout, settings, landing, ui (shadcn)
├── lib/
│   ├── markdown/      # Pipeline del renderizador y esquema de sanitización
│   ├── supabase/      # Clientes de navegador y servidor, y el proxy de sesión
│   ├── i18n/          # Textos de la interfaz
│   └── legal.ts       # Política de datos y términos de uso
├── proxy.ts           # Sesión, rutas privadas y cabeceras de seguridad (CSP)
└── types/             # Tipos de la base de datos
supabase/
├── migrations/        # Esquema, funciones de permisos, RLS y storage
├── templates/         # Plantillas de correo de Auth
└── seed.sql           # Datos de demo
tests/                 # unit (renderizador) y e2e
```

## Componentes de markdown

| Componente         | Sintaxis                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| Pasos              | `:::steps` con un `###` por paso                                               |
| Pestañas de código | `::::code-tabs` con bloques `~~~js title="JavaScript"`                         |
| Aviso              | `:::callout{type="info\|tip\|warning\|danger" title="..."}`                    |
| Acordeón           | `:::accordion{title="..."}`                                                    |
| Tarjeta            | `:::card{title="..." icon="rocket" href="/ruta"}` (lista de iconos en `/guia`) |
| Botón              | `:button[Texto]{href="/registro" variant="primary"}`                           |
| Columnas           | `::::columns` (separa columnas con `***`)                                      |
| Adjuntos           | `![alt](attachment:ID)` (se insertan solos al pegar o arrastrar)               |

Los contenedores se pueden anidar escribiendo siempre `:::`: el renderizador ajusta los dos puntos. No se permite HTML crudo ni `javascript:`.

## Seguridad y privacidad

- RLS activo en todas las tablas, sin acceso anónimo y con columnas editables acotadas.
- Bucket de adjuntos privado, con política de acceso por organización y página.
- Markdown sin HTML crudo, CSP y cabeceras de protección.
- Política de datos (`/privacidad`) y términos de uso (`/terminos`) con aceptación explícita al registrarse. Son una base redactada con asistencia de IA, no asesoría jurídica: que un abogado los revise antes de lanzar con usuarios reales.

## Contribuir

¡Las contribuciones son bienvenidas! Si quieres añadir componentes de markdown, mejorar el editor o proponer funciones, abre un issue o envía un pull request.

---

Hecho con ❤️ por [Maickol Rivera](https://github.com/MaickolRivera)
