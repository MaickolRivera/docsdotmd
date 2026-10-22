import { NextResponse, type NextRequest } from "next/server"

import { ATTACHMENTS_BUCKET, SIGNED_URL_TTL_SECONDS } from "@/lib/constants"
import { createClient } from "@/lib/supabase/server"
import { idSchema } from "@/lib/validators"

const NO_STORE = { "Cache-Control": "private, no-store" }

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: NO_STORE })
}

/**
 * `![...](attachment:ID)` apunta aquí. Si el usuario puede leer la página del
 * adjunto (RLS en attachments y en storage.objects), redirige a un enlace
 * firmado que vence en 60 segundos. Cualquier otro caso responde 404.
 */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/adjuntos/[id]">) {
  const { id } = await params
  if (!idSchema.safeParse(id).success) return notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: attachment } = await supabase
    .from("attachments")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle()
  if (!attachment) return notFound()

  const { data: signed, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(attachment.storage_path, SIGNED_URL_TTL_SECONDS)
  if (error || !signed) return notFound()

  return NextResponse.redirect(signed.signedUrl, { status: 302, headers: NO_STORE })
}
