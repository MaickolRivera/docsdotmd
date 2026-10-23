import "server-only"

import { t } from "@/lib/i18n"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/**
 * Envía la invitación con Resend si RESEND_API_KEY y EMAIL_FROM están
 * configuradas. Devuelve false si no se envió (la interfaz muestra el enlace).
 */
export async function sendInvitationEmail(params: {
  to: string
  orgName: string
  role: string
  link: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) return false

  const html = `<!doctype html><html lang="es"><body style="font-family:Arial,Helvetica,sans-serif;color:#18181b">
<p style="font-size:18px;font-weight:bold">DOCSdotmd</p>
<p>${escapeHtml(t.invitation.description(params.orgName, params.role))}</p>
<p><a href="${escapeHtml(params.link)}" style="display:inline-block;background:#625240;color:#f7f1e5;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">${escapeHtml(t.invitation.accept)}</a></p>
<p style="font-size:13px;color:#71717a">El enlace vence en 7 días y solo funciona con este correo.</p>
</body></html>`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: `Te invitaron a ${params.orgName} en DOCSdotmd`.replace(/[\r\n]/g, " "),
        html,
      }),
    })
    if (!response.ok) console.error("[email] resend", response.status, await response.text())
    return response.ok
  } catch (error) {
    console.error("[email] resend", error)
    return false
  }
}
