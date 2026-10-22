"use client"

import { CircleAlert } from "lucide-react"
import { useState, useTransition } from "react"

import { acceptInvitation } from "@/actions/members"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { t } from "@/lib/i18n"

export function AcceptInvitationButton({ token }: { token: string }) {
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  return (
    <>
      {error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await acceptInvitation({ token })
            if (result && !result.ok) setError(result.error)
          })
        }
      >
        {pending ? <Spinner /> : null}
        {pending ? t.invitation.accepting : t.invitation.accept}
      </Button>
    </>
  )
}
