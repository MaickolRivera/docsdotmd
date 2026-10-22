import { CircleAlert, MailCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { signOut } from "@/actions/auth"
import { AuthCard } from "@/components/forms/auth-card"
import { CenteredShell } from "@/components/layout/centered-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getSupabase, requireUser } from "@/lib/auth"
import type { Role } from "@/lib/constants"
import { t } from "@/lib/i18n"

import { AcceptInvitationButton } from "./accept-button"

export const metadata: Metadata = { title: t.invitation.title, robots: { index: false } }

export default async function InvitationPage({ params }: PageProps<"/invitacion/[token]">) {
  const { token } = await params
  const user = await requireUser(`/invitacion/${token}`)
  const supabase = await getSupabase()
  const { data } = await supabase.rpc("get_invitation", { p_token: token })
  const invitation = data?.[0]

  const problem = !invitation
    ? t.invitation.invalid
    : invitation.accepted
      ? t.invitation.alreadyAccepted
      : new Date(invitation.expires_at) < new Date()
        ? t.invitation.expired
        : null
  const wrongEmail = invitation && invitation.email !== user.email?.toLowerCase()

  return (
    <CenteredShell>
      <AuthCard
        title={invitation ? invitation.org_name : t.invitation.title}
        description={
          invitation
            ? t.invitation.description(
                invitation.org_name,
                t.roles[invitation.role as Role] ?? invitation.role,
              )
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {problem ? (
            <>
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{problem}</AlertDescription>
              </Alert>
              <Button asChild variant="outline">
                <Link href="/orgs">{t.invitation.goHome}</Link>
              </Button>
            </>
          ) : wrongEmail ? (
            <>
              <Alert>
                <MailCheck />
                <AlertDescription>{t.invitation.wrongEmail(invitation.email)}</AlertDescription>
              </Alert>
              <form action={signOut}>
                <input type="hidden" name="next" value={`/invitacion/${token}`} />
                <Button type="submit" variant="outline" className="w-full">
                  {t.invitation.switchAccount}
                </Button>
              </form>
            </>
          ) : (
            <AcceptInvitationButton token={token} />
          )}
        </div>
      </AuthCard>
    </CenteredShell>
  )
}
