// Textos de la interfaz en español. Centralizados aquí para poder traducir
// la aplicación más adelante sin buscar cadenas por todo el código.

export const es = {
  meta: {
    title: "DOCSdotmd",
    description: "Documentación privada para tu equipo, escrita en markdown con componentes.",
  },

  common: {
    appName: "DOCSdotmd",
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

  roles: {
    owner: "Owner",
    admin: "Admin",
    editor: "Editor",
    viewer: "Lector",
  },

  roleDescriptions: {
    owner: "Control total, incluso renombrar o borrar la organización",
    admin: "Gestiona miembros, grupos y espacios",
    editor: "Crea y edita páginas",
    viewer: "Solo lee la documentación",
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
    nav: {
      guide: "Guía",
    },
    badge: "Guía de componentes e iconos",
    title: "DOCS",
    titleAccent: "dotmd",
    subtitle: "Escribe en markdown con componentes interactivos y organiza tus espacios!",
    ctaPrimary: "Crear cuenta",
    ctaSecondary: "Ingresar",
    demo: {
      label: "Demo interactiva de DOCSdotmd",
      hint: "Demo interactiva.",
      org: "Acme",
      initials: "AM",
      pages: "Páginas del espacio",
    },
    featuresTitle: "Lo que tu equipo necesita",
    featuresSubtitle: "Escribe, organiza y comparte la documentación desde el primer día.",
    features: [
      {
        icon: "file-text",
        title: "Markdown con componentes",
        text: "Pasos, pestañas de código, avisos, tarjetas y acordeones con directivas simples. Sin HTML ni código ejecutable.",
      },
      {
        icon: "search",
        title: "Búsqueda instantánea",
        text: "Encuentra cualquier página con Ctrl + K. Solo aparecen resultados que tienes permiso de ver.",
      },
      {
        icon: "paperclip",
        title: "Archivos privados",
        text: "Imágenes y PDF guardados en privado y servidos con enlaces que caducan en segundos.",
      },
      {
        icon: "shield-check",
        title: "Acceso por organización",
        text: "Cada organización ve sus propios roles, grupos y espacios restringidos.",
      },
    ],
    footer: "Desarrollado con ♥ por ",
  },

  orgs: {
    title: "Tus organizaciones",
    description: "Elige una organización para entrar a su documentación.",
    emptyTitle: "Aún no perteneces a ninguna organización",
    emptyDescription: "Crea una nueva o pide a alguien de tu equipo que te invite.",
    new: "Nueva organización",
    open: "Entrar",
    newPage: {
      title: "Nueva organización",
      name: "Nombre de la organización",
      namePlaceholder: "Acme",
      submit: "Crear organización",
      invalidName: "Usa un nombre con letras o números.",
      slugTaken: "Esa dirección ya está en uso.",
      tooManySimilar: "Ya hay demasiadas organizaciones con un nombre parecido. Prueba con otro.",
    },
  },

  invitation: {
    title: "Invitación",
    description: (org: string, role: string) => `Te invitaron a ${org} con el rol ${role}.`,
    accept: "Aceptar invitación",
    accepting: "Aceptando…",
    wrongEmail: (email: string) =>
      `Esta invitación es para ${email}. Inicia sesión con ese correo para aceptarla.`,
    expired: "La invitación expiró. Pide a quien te invitó que te envíe una nueva.",
    invalid: "La invitación no es válida o ya se usó.",
    alreadyAccepted: "Esta invitación ya se aceptó.",
    goToOrg: "Ir a la organización",
    switchAccount: "Usar otra cuenta",
    goHome: "Ir a mis organizaciones",
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

  search: {
    placeholder: "Buscar en la documentación…",
    hint: "Escribe para buscar en todos los espacios a los que tienes acceso.",
    empty: (query: string) => `Sin resultados para «${query}».`,
    loading: "Buscando…",
    error: "No se pudo completar la búsqueda.",
    navigate: "para navegar",
    open: "para abrir",
  },

  sidebar: {
    label: "Páginas del espacio",
    newPage: "Página",
    newSubpage: "Agregar subpágina",
    reorder: "Ordenar",
    doneReordering: "Listo",
    moveUp: "Subir",
    moveDown: "Bajar",
    empty: "Este espacio aún no tiene páginas.",
    mobileTrigger: "Páginas",
    expand: "Expandir",
    collapse: "Contraer",
  },

  reader: {
    breadcrumb: "Ruta de navegación",
    onThisPage: "CONTENIDO",
    editPage: "Editar página",
    previous: "Anterior",
    next: "Siguiente",
    updatedAt: (date: string) => `Actualizado el ${date}`,
    updatedBy: (name: string, date: string) => `Actualizado por ${name} el ${date}`,
    draftNotice: "Borrador: solo la ven quienes pueden editar este espacio.",
    emptySpaceTitle: "Este espacio está vacío",
    emptySpaceEditor: "Crea la primera página para empezar.",
    emptySpaceViewer: "Todavía no hay páginas publicadas en este espacio.",
    createFirst: "Crear la primera página",
    noSpacesTitle: "No hay espacios disponibles",
    noSpacesAdmin: "Crea el primer espacio desde los ajustes de la organización.",
    noSpacesMember: "Aún no tienes acceso a ningún espacio de esta organización.",
    goToSettings: "Ir a ajustes",
  },

  editor: {
    title: "Título",
    titlePlaceholder: "Título de la página",
    newPageTitle: "Nueva página",
    slug: "Slug",
    parent: "Página padre",
    noParent: "Sin página padre",
    status: "Estado",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Página guardada",
    unsaved: "Cambios sin guardar",
    upToDate: "Todo guardado",
    viewPage: "Ver página",
    backToPage: "Volver",
    deletePage: "Borrar página",
    deleteTitle: "¿Borrar esta página?",
    deleteDescription: (children: number) =>
      children > 0
        ? `También se borrarán ${children} subpáginas y todos sus adjuntos. Esta acción no se puede deshacer.`
        : "Se borrará la página con sus adjuntos. Esta acción no se puede deshacer.",
    deleted: "Página borrada",
    tabEdit: "Editar",
    tabPreview: "Vista previa",
    placeholder: "Escribe en markdown… Usa / al inicio de una línea para insertar componentes.",
    previewEmpty: "La vista previa aparecerá aquí.",
    shortcutHint: "Ctrl + S para guardar",
    restoreTitle: "Tienes un borrador local más reciente que la versión guardada.",
    restore: "Restaurar",
    discard: "Descartar",
    leaveConfirm: "Tienes cambios sin guardar. ¿Quieres salir de todas formas?",
    slugTaken: "Ya existe una página con ese slug en este espacio.",
    cycle: "Una página no puede ser hija de sí misma ni de sus subpáginas.",
    toolbar: {
      bold: "Negrita",
      italic: "Cursiva",
      heading: "Título",
      list: "Lista",
      link: "Enlace",
      code: "Código",
      codeBlock: "Bloque de código",
      table: "Tabla",
      insert: "Insertar componente",
      attach: "Adjuntar archivo",
      guide: "Guía",
      guideHint: "Componentes e iconos disponibles (se abre en otra pestaña)",
    },
    icons: {
      unknown: (names: string[]) =>
        `Icono no reconocido: ${names.join(", ")}. Se mostrará el icono por defecto.`,
      seeAll: "Ver iconos disponibles",
    },
    components: {
      steps: { label: "Pasos", description: "Guía numerada, un ### por paso" },
      codeTabs: {
        label: "Pestañas de código",
        description: "El mismo ejemplo en varios lenguajes",
      },
      callout: { label: "Aviso", description: "Nota, consejo, advertencia o peligro" },
      accordion: { label: "Acordeón", description: "Contenido que se despliega" },
      card: { label: "Tarjeta", description: "Icono, título, texto y enlace" },
      button: { label: "Botón", description: "Enlace con estilo de botón" },
      columns: { label: "Columnas", description: "Dos columnas; sepáralas con ***" },
    },
    // Plantillas que se insertan con el menú "Insertar componente" o con "/".
    templates: {
      steps: `:::steps
### Primer paso
Describe el primer paso.

### Segundo paso
Describe el segundo paso.
:::`,
      codeTabs: `::::code-tabs
~~~js title="JavaScript"
console.log("Hola");
~~~
~~~python title="Python"
print("Hola")
~~~
::::`,
      callout: `:::callout{type="info" title="Importante"}
Escribe aquí el aviso.
:::`,
      accordion: `:::accordion{title="Pregunta frecuente"}
Escribe aquí la respuesta.
:::`,
      card: `:::card{title="Título" icon="book-open" href="/"}
Descripción breve.
:::`,
      button: `:button[Texto del botón]{href="/" variant="primary"}`,
      columns: `::::columns
### Columna izquierda
Contenido de la izquierda.

***

### Columna derecha
Contenido de la derecha.
::::`,
      table: `| Columna | Columna |
| --- | --- |
| Celda | Celda |`,
      link: "texto del enlace",
      bold: "texto en negrita",
      italic: "texto en cursiva",
      code: "código",
      heading: "Título",
      listItem: "Elemento",
    },
    moreActions: "Más acciones",
    attachments: {
      title: "Adjuntos",
      empty: "Arrastra o pega archivos en el editor, o usa el botón de adjuntar.",
      uploading: (name: string) => `Subiendo ${name}…`,
      uploaded: "Archivo adjuntado",
      tooLarge: "El archivo supera el límite de 4 MB.",
      typeNotAllowed: "Solo se permiten imágenes, PDF y archivos de texto.",
      insert: "Insertar en la página",
      delete: "Borrar adjunto",
      deleted: "Adjunto borrado",
    },
  },

  settings: {
    title: "Ajustes",
    nav: {
      general: "General",
      members: "Miembros",
      groups: "Grupos",
      spaces: "Espacios",
    },
    general: {
      title: "General",
      description: "Nombre y dirección de la organización.",
      name: "Nombre",
      slug: "Dirección",
      slugWarning: "Si cambias la dirección, los enlaces que ya compartiste dejarán de funcionar.",
      saved: "Organización actualizada",
      onlyOwner: "Solo un owner puede cambiar estos datos.",
      transferTitle: "Transferir ownership",
      transferDescription: "La persona elegida quedará como owner y tú pasarás a admin.",
      transferSelect: "Elige un miembro",
      transferSubmit: "Transferir",
      transferConfirm: (name: string) => `¿Transferir la organización a ${name}?`,
      transferDone: "Ownership transferido",
      transferEmpty: "Invita a alguien más para poder transferir la organización.",
      leaveTitle: "Salir de la organización",
      leaveDescription: "Perderás el acceso a toda su documentación.",
      leaveSubmit: "Salir de la organización",
      leaveConfirm: "¿Seguro que quieres salir de la organización?",
      deleteTitle: "Borrar organización",
      deleteDescription:
        "Se borran espacios, páginas, grupos, invitaciones y archivos. Esta acción no se puede deshacer.",
      deleteSubmit: "Borrar organización",
      deleteConfirmTitle: "¿Borrar la organización?",
      deleteConfirmLabel: (slug: string) => `Escribe ${slug} para confirmar`,
      deleteMismatch: "El texto no coincide.",
    },
    members: {
      title: "Miembros",
      description: "Invita a tu equipo y define qué puede hacer cada persona.",
      invite: "Invitar",
      inviteTitle: "Invitar a un miembro",
      inviteDescription: "La invitación vence en 7 días y solo funciona con ese correo.",
      send: "Crear invitación",
      linkTitle: "Invitación creada",
      linkEmailSent: "Enviamos el enlace por correo. También puedes copiarlo:",
      linkCopy: "Copia este enlace y compártelo con la persona invitada. No se volverá a mostrar.",
      copyLink: "Copiar enlace",
      name: "Nombre",
      email: "Correo",
      role: "Rol",
      joined: "Desde",
      you: "tú",
      remove: "Quitar",
      removeConfirm: (name: string) => `¿Quitar a ${name} de la organización?`,
      removed: "Miembro quitado",
      roleChanged: "Rol actualizado",
      pending: "Invitaciones pendientes",
      noPending: "No hay invitaciones pendientes.",
      expires: (date: string) => `Vence el ${date}`,
      expired: "Vencida",
      revoke: "Revocar",
      revoked: "Invitación revocada",
      alreadyMember: "Esa persona ya es miembro de la organización.",
      cannotManageOwners: "Solo un owner puede cambiar o quitar a otro owner.",
      lastOwner: "La organización debe tener al menos un owner.",
    },
    groups: {
      title: "Grupos",
      description: "Agrupa miembros para darles acceso a espacios restringidos.",
      new: "Nuevo grupo",
      name: "Nombre del grupo",
      namePlaceholder: "Ingeniería",
      create: "Crear grupo",
      rename: "Renombrar",
      renamed: "Grupo actualizado",
      delete: "Borrar grupo",
      deleteConfirm: (name: string) =>
        `¿Borrar el grupo ${name}? Sus integrantes perderán el acceso que el grupo les daba.`,
      deleted: "Grupo borrado",
      membersCount: (n: number) => (n === 1 ? "1 integrante" : `${n} integrantes`),
      addMember: "Agregar integrante",
      selectMember: "Elige un miembro",
      add: "Agregar",
      removeMember: "Quitar del grupo",
      empty: "Aún no hay grupos.",
      emptyMembers: "Este grupo no tiene integrantes.",
      nameTaken: "Ya existe un grupo con ese nombre.",
      spacesAccess: "Espacios con acceso",
    },
    spaces: {
      title: "Espacios",
      description:
        "Son las pestañas de la documentación. Cada espacio puede verlo toda la organización o solo algunos grupos.",
      new: "Nuevo espacio",
      editTitle: "Editar espacio",
      newTitle: "Nuevo espacio",
      name: "Nombre",
      namePlaceholder: "API Reference",
      slug: "Slug",
      icon: "Icono",
      visibility: "Visibilidad",
      visibilityOrg: "Toda la organización",
      visibilityOrgHelp: "Lo ven todos los miembros; lo editan editores, admins y owners.",
      visibilityRestricted: "Restringido",
      visibilityRestrictedHelp: "Solo lo ven owners, admins y los grupos que elijas.",
      groupsAccess: "Grupos con acceso",
      noAccess: "Sin acceso",
      permissionRead: "Leer",
      permissionEdit: "Editar",
      noGroups: "Crea grupos primero para restringir el acceso.",
      save: "Guardar espacio",
      saved: "Espacio guardado",
      delete: "Borrar espacio",
      deleteConfirm: (name: string) =>
        `¿Borrar el espacio ${name}? Se borrarán todas sus páginas y adjuntos.`,
      deleted: "Espacio borrado",
      moveUp: "Subir",
      moveDown: "Bajar",
      empty: "Aún no hay espacios.",
      slugTaken: "Ya existe un espacio con ese slug.",
      open: "Abrir",
      pages: (n: number) => (n === 1 ? "1 página" : `${n} páginas`),
    },
  },

  docs: {
    callout: {
      info: "Nota",
      tip: "Consejo",
      warning: "Advertencia",
      danger: "Peligro",
    },
    copyCode: "Copiar código",
    codeCopied: "Copiado",
    codeTabs: "Ejemplos de código",
    externalLink: "(abre en otra pestaña)",
    footnotes: "Notas",
    footnoteBack: "Volver al texto",
    openLink: "Abrir enlace",
  },

  guide: {
    title: "Guía de componentes",
    description:
      "Cómo escribir una página en DOCSdotmd: cada componente con su sintaxis y cómo se ve, y la lista de iconos disponibles.",
    lead: "Todo lo que puedes usar al escribir una página, con su sintaxis y cómo se ve. Copia cualquier ejemplo y pégalo en el editor.",
    result: "Resultado",
    viewSource: "Ver el markdown de esta sección",
    goToApp: "Ingresar",
    icons: {
      search: "Buscar por nombre o alias…",
      count: (n: number) => (n === 1 ? "1 icono" : `${n} iconos`),
      empty: (query: string) => `No hay iconos para «${query}».`,
      copy: (name: string) => `Copiar el nombre ${name}`,
      copied: (name: string) => `Copiado: ${name}`,
      copyFailed: "No se pudo copiar. Selecciona el nombre y cópialo a mano.",
      aliases: (aliases: string[]) => `También: ${aliases.join(", ")}`,
    },
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
