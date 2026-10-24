// Marco: Ley 1581 de 2012 y Decreto 1377 de 2013 (hoy compilado en el Decreto
// 1074 de 2015), de protección de datos personales en Colombia.

export const LEGAL_VERSION = "2026-10-24"
export const LEGAL_UPDATED = "24 de octubre de 2026"

export const CONTROLLER = {
  name: "Maickol Rivera",
  site: "https://www.maickolrivera.me/",
  email: "msrivera.msro@gmail.com",
}

/** Canal para ejercer derechos y soporte. Se define con NEXT_PUBLIC_CONTACT_EMAIL. */
export function contactChannel(): string {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || CONTROLLER.email
  return `el correo electrónico ${email}`
}

/** Un párrafo (string) o una lista con viñetas (string[]). */
export type LegalBlock = string | string[]
export type LegalSection = { id: string; title: string; blocks: LegalBlock[] }
export type LegalDocument = {
  title: string
  description: string
  intro: string
  sections: LegalSection[]
}

export function privacyDocument(): LegalDocument {
  const contact = contactChannel()
  return {
    title: "Política de tratamiento de datos personales",
    description:
      "Qué datos personales trata DOCSdotmd, para qué, con quién se comparten, cómo se protegen y cómo ejercer tus derechos.",
    intro:
      "Esta política explica cómo DOCSdotmd trata tus datos personales, de acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia. Al crear tu cuenta nos autorizas a tratarlos como se describe aquí.",
    sections: [
      {
        id: "responsable",
        title: "1. Responsable del tratamiento",
        blocks: [
          `El responsable del tratamiento es ${CONTROLLER.name}, titular del proyecto DOCSdotmd (${CONTROLLER.site}).`,
        ],
      },
      {
        id: "datos",
        title: "2. Qué datos tratamos",
        blocks: [
          "Solo tratamos los datos necesarios para que el servicio funcione:",
          [
            "Datos de cuenta: nombre completo, correo electrónico y contraseña. La contraseña la gestiona el proveedor de autenticación y se guarda cifrada (hash): nosotros nunca la vemos.",
            "Datos de organización: nombre y dirección de la organización, tus roles, los grupos a los que perteneces y las invitaciones (correo de la persona invitada y rol).",
            "Contenido que creas: páginas en markdown, espacios y archivos adjuntos (imágenes, PDF y texto).",
            "Datos técnicos: dirección IP, tipo de navegador y fechas de acceso, que registran nuestros proveedores de infraestructura por seguridad y funcionamiento.",
            "Datos de consentimiento: fecha y versión de los textos que aceptaste al registrarte.",
          ],
          "No solicitamos datos sensibles (salud, origen racial, orientación política o sexual, datos biométricos, entre otros) ni datos de menores de edad. Te pedimos no subirlos a la plataforma.",
        ],
      },
      {
        id: "finalidades",
        title: "3. Para qué usamos tus datos",
        blocks: [
          [
            "Crear y administrar tu cuenta y verificar tu identidad.",
            "Prestarte el servicio: guardar y mostrar tu documentación según los permisos de cada organización.",
            "Enviarte correos del servicio: confirmación de cuenta, recuperación de contraseña e invitaciones.",
            "Proteger la plataforma: prevenir abusos, fraudes y accesos no autorizados.",
            "Cumplir obligaciones legales y atender requerimientos de autoridades competentes.",
          ],
          "No vendemos ni alquilamos tus datos, no hacemos publicidad ni perfilamiento y no usamos herramientas de analítica o seguimiento de terceros.",
        ],
      },
      {
        id: "autorizacion",
        title: "4. Autorización",
        blocks: [
          "Tratamos tus datos con tu autorización previa, expresa e informada, que das marcando la casilla de aceptación al crear tu cuenta. Puedes revocarla en cualquier momento escribiendo al canal de contacto; si lo haces, no podremos seguir prestándote el servicio.",
          "La plataforma no está dirigida a menores de 18 años.",
        ],
      },
      {
        id: "terceros",
        title: "5. Proveedores y transferencias",
        blocks: [
          "Para operar el servicio usamos proveedores que actúan como encargados del tratamiento y solo tratan los datos por nuestra cuenta:",
          [
            "Supabase: base de datos, autenticación y almacenamiento de archivos.",
            "Vercel: alojamiento y entrega de la aplicación web.",
            "Resend: envío de correos de invitación, cuando está activado.",
          ],
          "Algunos de estos proveedores pueden procesar datos en servidores fuera de Colombia. Al aceptar esta política autorizas esa transmisión internacional. Solo trabajamos con proveedores que ofrecen medidas de seguridad adecuadas.",
          "Fuera de ellos, solo compartiremos datos si una autoridad competente lo exige por ley.",
        ],
      },
      {
        id: "visibilidad",
        title: "6. Quién puede ver tu información",
        blocks: [
          [
            "Tu nombre y correo son visibles para los miembros de las organizaciones a las que perteneces.",
            "El contenido de cada espacio solo lo ven las personas que tienen acceso según su rol y los grupos de la organización. Los borradores solo los ven quienes pueden editar el espacio.",
            "Los owners y administradores de una organización pueden ver todos sus espacios, miembros e invitaciones.",
            "Los archivos adjuntos son privados y se sirven con enlaces temporales que caducan en segundos.",
          ],
          "Cada organización decide qué contenido sube y a quién invita. Quien invita a otra persona declara tener derecho a compartir su correo con nosotros para ese fin.",
        ],
      },
      {
        id: "cookies",
        title: "7. Cookies y almacenamiento local",
        blocks: [
          [
            "Cookies de sesión: necesarias para mantenerte conectado y proteger tu cuenta. Sin ellas el servicio no funciona.",
            "Almacenamiento local del navegador: guarda tu preferencia de tema (claro u oscuro) y borradores del editor para que no pierdas lo que escribes. Quedan en tu dispositivo.",
          ],
          "No usamos cookies publicitarias ni de analítica.",
        ],
      },
      {
        id: "seguridad",
        title: "8. Seguridad de la información",
        blocks: [
          "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:",
          [
            "Conexiones cifradas (HTTPS) y contraseñas almacenadas con hash.",
            "Aislamiento entre organizaciones con reglas de acceso a nivel de base de datos (Row Level Security): cada consulta se limita a lo que el usuario puede ver.",
            "Archivos en almacenamiento privado, con enlaces firmados de muy corta duración.",
            "Enlaces de invitación de un solo uso, con vencimiento y guardados solo como hash.",
            "El markdown no admite HTML ni scripts, y la aplicación usa una política de seguridad de contenido (CSP) y cabeceras de protección.",
            "Principio de mínimo privilegio: cada rol solo accede a lo que necesita.",
          ],
          "Ningún sistema es completamente invulnerable. Si ocurre un incidente que afecte tus datos, te informaremos y notificaremos a la Superintendencia de Industria y Comercio cuando la ley lo exija. Si encuentras una vulnerabilidad, repórtala por el canal de contacto antes de divulgarla.",
        ],
      },
      {
        id: "conservacion",
        title: "9. Conservación y eliminación",
        blocks: [
          "Conservamos tus datos mientras tengas la cuenta activa o sean necesarios para prestarte el servicio. Al eliminar una organización se borran sus espacios, páginas, grupos, miembros y adjuntos.",
          "Puedes pedir la eliminación de tu cuenta y tus datos por el canal de contacto. Por ahora esa solicitud se atiende manualmente. Los proveedores pueden conservar copias de seguridad o registros técnicos durante un tiempo limitado, y podemos guardar la información que una ley nos obligue a mantener.",
        ],
      },
      {
        id: "derechos",
        title: "10. Tus derechos como titular",
        blocks: [
          "Según el artículo 8 de la Ley 1581 de 2012 tienes derecho a:",
          [
            "Conocer, actualizar y rectificar tus datos personales.",
            "Solicitar prueba de la autorización que nos diste.",
            "Ser informado sobre el uso que damos a tus datos.",
            "Revocar la autorización y solicitar la supresión de tus datos, cuando no haya un deber legal o contractual de conservarlos.",
            "Acceder de forma gratuita a tus datos personales.",
            "Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.",
          ],
          `Para ejercerlos, escribe a través de ${contact} indicando tu nombre, el correo de tu cuenta y lo que solicitas. Responderemos las consultas en máximo 10 días hábiles (prorrogables por 5 más) y los reclamos en máximo 15 días hábiles (prorrogables por 8 más), según los artículos 14 y 15 de la ley.`,
        ],
      },
      {
        id: "cambios",
        title: "11. Cambios en esta política",
        blocks: [
          "Podemos actualizar esta política. Si el cambio es relevante, lo avisaremos en la plataforma o por correo y, cuando la ley lo exija, pediremos de nuevo tu autorización. La versión vigente es la publicada en esta página, con su fecha de actualización.",
        ],
      },
    ],
  }
}

export function termsDocument(): LegalDocument {
  return {
    title: "Términos de uso",
    description:
      "Las reglas para usar DOCSdotmd: tu cuenta, tu contenido, el uso aceptable y los límites de responsabilidad.",
    intro:
      "Estos términos regulan el uso de DOCSdotmd. Al crear una cuenta o usar la plataforma declaras que los leíste y los aceptas. Si no estás de acuerdo, no la uses.",
    sections: [
      {
        id: "servicio",
        title: "1. El servicio",
        blocks: [
          "DOCSdotmd es un proyecto independiente desarrollado con fines experimentales, de portafolio y demostración técnica para la gestión de documentación en markdown.",
          "El servicio se ofrece 'tal cual' (as is) en fase de prueba o beta: puede experimentar cambios, interrupciones, errores o discontinuación en cualquier momento. No constituye un servicio comercial garantizado ni incluye acuerdos de nivel de servicio (SLA).",
        ],
      },
      {
        id: "cuenta",
        title: "2. Tu cuenta",
        blocks: [
          [
            "Debes ser mayor de 18 años y tener capacidad legal para aceptar estos términos.",
            "Debes dar información veraz y mantenerla actualizada.",
            "Eres responsable de tu contraseña y de lo que ocurra con tu cuenta. Avísanos de inmediato si sospechas un acceso no autorizado.",
          ],
        ],
      },
      {
        id: "organizaciones",
        title: "3. Organizaciones y roles",
        blocks: [
          "Quien crea una organización es su owner. Los owners y administradores gestionan miembros, grupos, espacios e invitaciones, y son responsables de los permisos que asignan.",
          "Si invitas a alguien, declaras que tienes derecho a compartir su correo con nosotros para ese fin. Quien recibe la invitación puede ignorarla.",
        ],
      },
      {
        id: "contenido",
        title: "4. Tu contenido",
        blocks: [
          "El contenido que subes es tuyo (o de tu organización). Nos das una licencia limitada, no exclusiva y gratuita para alojarlo, procesarlo y mostrarlo únicamente para prestar el servicio.",
          "Eres el único responsable de tu contenido. Garantizas que tienes los derechos necesarios para publicarlo y que no infringe la ley ni derechos de terceros.",
          "Los adjuntos admiten imágenes, PDF y texto plano de hasta 4 MB. No subas datos sensibles ni de menores de edad.",
        ],
      },
      {
        id: "uso-aceptable",
        title: "5. Uso aceptable",
        blocks: [
          "Está prohibido usar la plataforma para:",
          [
            "Publicar contenido ilegal, difamatorio, discriminatorio o que vulnere derechos de autor, privacidad u otros derechos.",
            "Subir malware o intentar acceder a cuentas, organizaciones o datos que no te corresponden.",
            "Hacer pruebas de seguridad, escaneos automatizados o ataques de denegación de servicio sin autorización escrita.",
            "Enviar spam o invitaciones masivas no solicitadas.",
            "Saltarte los límites técnicos o de seguridad del servicio.",
          ],
          "Podemos retirar contenido o suspender cuentas que incumplan estas reglas.",
        ],
      },
      {
        id: "disponibilidad",
        title: "6. Disponibilidad y copias de seguridad",
        blocks: [
          "No garantizamos que el servicio sea continuo ni libre de errores, ni que no haya pérdida de datos. Te recomendamos conservar una copia de tu documentación importante fuera de la plataforma.",
        ],
      },
      {
        id: "responsabilidad",
        title: "7. Exclusión de garantías y límite de responsabilidad",
        blocks: [
          "El servicio se ofrece «tal cual» y «según disponibilidad», sin garantías de ningún tipo en la medida permitida por la ley.",
          "En la medida permitida por la ley, el titular no responde por daños indirectos, lucro cesante, pérdida de datos o de oportunidades derivados del uso o la imposibilidad de usar el servicio, ni por el contenido que suban los usuarios. Nada de lo anterior excluye responsabilidades que la ley no permita limitar, incluidos los derechos que te reconoce el Estatuto del Consumidor cuando apliquen.",
        ],
      },
      {
        id: "terminacion",
        title: "8. Suspensión y terminación",
        blocks: [
          "Puedes dejar de usar el servicio y pedir la eliminación de tu cuenta cuando quieras. Podemos suspender o cerrar cuentas que incumplan estos términos o pongan en riesgo la plataforma o a otros usuarios, o dar por terminado el servicio avisando con antelación razonable.",
        ],
      },
      {
        id: "datos",
        title: "9. Datos personales",
        blocks: [
          "El tratamiento de tus datos personales se rige por la Política de tratamiento de datos, que forma parte de estos términos.",
        ],
      },
      {
        id: "cambios",
        title: "10. Cambios en los términos",
        blocks: [
          "Podemos modificar estos términos. Los cambios relevantes se avisarán en la plataforma o por correo. Si sigues usando el servicio después de la fecha de actualización, aceptas la nueva versión.",
        ],
      },
    ],
  }
}
