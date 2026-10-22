"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { createPage } from "@/actions/pages"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function CreatePageButton({ spaceId, label }: { spaceId: string; label: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createPage({ spaceId, parentId: null })
          if (result.ok) router.push(result.data.href)
          else toast.error(result.error)
        })
      }
    >
      {pending ? <Spinner /> : <Plus data-icon="inline-start" />}
      {label}
    </Button>
  )
}
