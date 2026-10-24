import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"
import { termsDocument } from "@/lib/legal"

const document = termsDocument()

export const metadata: Metadata = { title: document.title, description: document.description }

export default function TermsPage() {
  return <LegalPage document={document} />
}
