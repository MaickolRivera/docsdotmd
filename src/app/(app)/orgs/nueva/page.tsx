import type { Metadata } from "next"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"

import { NewOrgForm } from "./new-org-form"

export const metadata: Metadata = { title: t.orgs.newPage.title }

export default function NewOrgPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>{t.orgs.newPage.title}</h1>
          </CardTitle>
          <CardDescription>{t.orgs.newPage.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NewOrgForm />
        </CardContent>
      </Card>
    </div>
  )
}
