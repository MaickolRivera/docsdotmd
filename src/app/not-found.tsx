import { SearchX } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { t } from "@/lib/i18n"

// La misma respuesta para "no existe" y "no tienes acceso": así no se revela
// qué organizaciones, espacios o páginas existen.
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>{t.notFound.title}</EmptyTitle>
          <EmptyDescription>{t.notFound.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/orgs">{t.notFound.back}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
