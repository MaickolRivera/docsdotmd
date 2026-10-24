import Link from "next/link"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { t } from "@/lib/i18n"
import { LEGAL_UPDATED, type LegalBlock, type LegalDocument } from "@/lib/legal"

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return <p className="mt-3 leading-7 text-muted-foreground">{block}</p>
  }
  return (
    <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-muted-foreground marker:text-primary">
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Página pública para textos legales (privacidad, términos). */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label={t.common.appName} className="mt-1">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-190 flex-1 px-4 pt-10 pb-20">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{document.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: {LEGAL_UPDATED}</p>
        <p className="mt-6 leading-7 text-muted-foreground">{document.intro}</p>

        <nav aria-label="Contenido" className="mt-8 rounded-xl border bg-card p-4">
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </section>
        ))}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center gap-6 px-4 text-sm text-muted-foreground">
          <Link href="/privacidad" className="hover:text-foreground">
            {t.legal.privacy}
          </Link>
          <Link href="/terminos" className="hover:text-foreground">
            {t.legal.terms}
          </Link>
        </div>
      </footer>
    </div>
  )
}
