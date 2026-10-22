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

  validation: {
    required: "Este campo es obligatorio",
    email: "Escribe un correo válido",
    passwordMin: (min: number) => `Usa al menos ${min} caracteres`,
    passwordMax: "La contraseña es demasiado larga",
    passwordsMismatch: "Las contraseñas no coinciden",
    nameLength: (min: number, max: number) => `Usa entre ${min} y ${max} caracteres`,
    slugFormat: "Solo minúsculas, números y guiones (sin guion al inicio ni al final)",
    slugReserved: "Esa dirección está reservada por la aplicación",
    titleLength: "El título debe tener entre 1 y 160 caracteres",
    contentTooLong: (max: number) =>
      `El contenido supera el límite de ${max.toLocaleString("es")} caracteres`,
    invalidId: "Identificador no válido",
  },

  auth: {
    email: "Correo",
    emailPlaceholder: "tu@empresa.com",
    password: "Contraseña",
    fullName: "Nombre",
    fullNamePlaceholder: "Ana Martínez",
    signOut: "Cerrar sesión",
    login: {
      title: "Inicia sesión",
      description: "Entra con tu correo y contraseña.",
      submit: "Entrar",
      forgot: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes cuenta?",
      register: "Regístrate",
      invalidCredentials: "Correo o contraseña incorrectos.",
      emailNotConfirmed: "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.",
      linkError: "El enlace no es válido o ya expiró. Pide uno nuevo.",
    },
    register: {
      title: "Crea tu cuenta",
      description: "Empieza a documentar con tu equipo.",
      submit: "Crear cuenta",
      haveAccount: "¿Ya tienes cuenta?",
      login: "Inicia sesión",
      checkEmailTitle: "Revisa tu correo",
      checkEmail: (email: string) =>
        `Te enviamos un enlace a ${email} para confirmar tu cuenta. Ábrelo para continuar.`,
      emailTaken: "Ya existe una cuenta con ese correo.",
      weakPassword: "La contraseña es muy débil. Usa una más larga o más variada.",
    },
    recover: {
      title: "Recupera tu contraseña",
      description: "Te enviaremos un enlace para crear una nueva.",
      submit: "Enviar enlace",
      sentTitle: "Revisa tu correo",
      sent: "Si existe una cuenta con ese correo, recibirás un enlace para crear una contraseña nueva.",
      backToLogin: "Volver a iniciar sesión",
    },
    updatePassword: {
      title: "Crea una contraseña nueva",
      description: "Elige una contraseña que no uses en otros sitios.",
      password: "Contraseña nueva",
      confirm: "Repite la contraseña",
      submit: "Guardar contraseña",
      invalidSession: "El enlace no es válido o ya expiró.",
      requestNew: "Pedir un enlace nuevo",
      success: "Contraseña actualizada.",
    },
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
