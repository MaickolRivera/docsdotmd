// Textos de la interfaz en español. Centralizados aquí para poder traducir
// la aplicación más adelante sin buscar cadenas por todo el código.

export const es = {
  meta: {
    title: "DOCSmd",
    description: "Documentación privada para tu equipo, escrita en markdown con componentes.",
  },

  common: {
    appName: "DOCSmd",
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    delete: "Borrar",
    deleting: "Borrando…",
    create: "Crear",
    creating: "Creando…",
    edit: "Editar",
    close: "Cerrar",
    back: "Volver",
    loading: "Cargando…",
    copy: "Copiar",
    copied: "Copiado",
    optional: "opcional",
    draft: "Borrador",
    published: "Publicado",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    forbidden: "No tienes permiso para hacer esto.",
    notFound: "No se encontró lo que buscas o no tienes acceso.",
    invalidData: "Revisa los datos del formulario.",
    rateLimited: "Demasiados intentos. Espera un momento y vuelve a intentarlo.",
  },

  landing: {
    title: "La documentación de tu equipo, clara y",
    titleAccent: "en un solo lugar.",
    subtitle:
      "Escribe en markdown con pasos, pestañas de código, avisos y acordeones. Organiza por espacios y decide quién ve cada uno.",
    ctaPrimary: "Crear cuenta",
    ctaSecondary: "Iniciar sesión",
    featuresTitle: "Todo lo que tu equipo necesita",
    featuresSubtitle:
      "Escribe, organiza y comparte la documentación con los permisos correctos desde el primer día.",
    features: [
      {
        title: "Markdown con componentes",
        text: "Pasos, pestañas de código, avisos, tarjetas y acordeones con directivas simples. Sin HTML ni código ejecutable.",
      },
      {
        title: "Acceso por organización",
        text: "Cada organización ve solo lo suyo. Roles, grupos y espacios restringidos protegidos en la base de datos.",
      },
      {
        title: "Búsqueda instantánea",
        text: "Encuentra cualquier página con Ctrl + K. Solo aparecen resultados que tienes permiso de ver.",
      },
      {
        title: "Archivos privados",
        text: "Imágenes y PDF guardados en privado y servidos con enlaces que caducan en segundos.",
      },
    ],
    footer: "Hecho con Next.js y Supabase.",
  },

  header: {
    home: "Inicio",
    search: "Buscar…",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    toggleTheme: "Cambiar tema",
    settings: "Ajustes",
    organizations: "Organizaciones",
    allOrganizations: "Ver todas",
    newOrganization: "Nueva organización",
    userMenu: "Menú de usuario",
    spaces: "Espacios",
  },

  notFound: {
    title: "Página no encontrada",
    description: "La página no existe o no tienes acceso a ella.",
    back: "Volver al inicio",
  },

  error: {
    title: "Algo salió mal",
    description: "Ocurrió un error inesperado. Puedes intentarlo de nuevo.",
    retry: "Reintentar",
  },
} as const

export type Messages = typeof es
