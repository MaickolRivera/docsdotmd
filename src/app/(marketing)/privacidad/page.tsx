import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"
import { privacyDocument } from "@/lib/legal"

const document = privacyDocument()

export const metadata: Metadata = { title: document.title, description: document.description }

export default function PrivacyPage() {
  return <LegalPage document={document} />
}
