// Textos de la interfaz en español. Centralizados aquí para poder traducir
// la aplicación más adelante sin buscar cadenas por todo el código.

export const es = {
  meta: {
    title: "DOCSmd",
    description: "Documentación privada para tu equipo, escrita en markdown con componentes.",
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
