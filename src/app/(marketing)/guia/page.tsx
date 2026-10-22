import { ArrowRight, Eye } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { DocAccordion } from "@/components/docs/accordion"
import { IconGallery } from "@/components/guide/icon-gallery"
import { Toc } from "@/components/layout/toc"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  GUIDE_ICONS,
  GUIDE_PROCESS,
  GUIDE_SECTIONS,
  GUIDE_TOC,
  toCodeBlock,
  type GuideExample,
} from "@/lib/guide"
import { t } from "@/lib/i18n"
import { DocsMarkdown } from "@/lib/markdown/render"

export const metadata: Metadata = {
  title: t.guide.title,
  description: t.guide.description,
}

/**
 * Sin margen arriba del primer bloque ni debajo del último. Con !important
 * porque pasos y columnas definen su margen fuera de las capas de Tailwind.
 */
const trim = "[&>:first-child]:mt-0! [&>:last-child]:mb-0!"

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-16 mb-4 text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  )
}

function ExampleHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-10 mb-2 text-lg font-semibold tracking-tight">
      {children}
    </h3>
  )
}

/** El ejemplo renderizado y, debajo, su markdown con botón de copiar. */
function Example({ example }: { example: GuideExample }) {
  if (example.preview === false) {
    return (
      <div className="my-5">
        <DocsMarkdown source={toCodeBlock(example.source)} className={trim} />
      </div>
    )
  }
  return (
    <div className="my-5">
      <div className="rounded-t-xl border border-b-0 p-5 sm:px-6">
        <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Eye className="size-3.5" />
          {t.guide.result}
        </p>
        <DocsMarkdown source={example.source} className={trim} />
      </div>
      <DocsMarkdown
        source={toCodeBlock(example.source)}
        className="[&_.docs-code]:my-0 [&_.docs-code]:rounded-t-none"
      />
    </div>
  )
}

/** Guía pública de componentes e iconos, escrita con los mismos componentes. */
export default function GuidePage() {
  return (
    // data-header="compact": header de una fila (ver --header-height en globals.css).
    <div data-header="compact" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" aria-label={t.common.appName}>
              <Logo />
            </Link>
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
            <span className="truncate text-sm font-medium">{t.landing.nav.guide}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/orgs">
                {t.guide.goToApp}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <main className="min-w-0 flex-1 px-4 pt-10 pb-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[760px]">
            <p className="text-sm font-medium text-primary">{t.landing.nav.guide}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
              {t.guide.title}
            </h1>
            <p className="mt-3 text-lg text-pretty text-muted-foreground">{t.guide.lead}</p>

            <section>
              <SectionHeading id={GUIDE_PROCESS.id}>{GUIDE_PROCESS.title}</SectionHeading>
              <DocsMarkdown source={GUIDE_PROCESS.source} className={trim} />
              <DocAccordion title={t.guide.viewSource}>
                <DocsMarkdown source={toCodeBlock(GUIDE_PROCESS.source)} className={trim} />
              </DocAccordion>
            </section>

            {GUIDE_SECTIONS.map((section) => (
              <section key={section.id}>
                <SectionHeading id={section.id}>{section.title}</SectionHeading>
                {section.intro ? <DocsMarkdown source={section.intro} className={trim} /> : null}
                {section.examples.map((example) => (
                  <div key={example.id}>
                    <ExampleHeading id={example.id}>{example.title}</ExampleHeading>
                    <DocsMarkdown source={example.description} className={trim} />
                    <Example example={example} />
                  </div>
                ))}
              </section>
            ))}

            <section>
              <SectionHeading id={GUIDE_ICONS.id}>{GUIDE_ICONS.title}</SectionHeading>
              <DocsMarkdown source={GUIDE_ICONS.intro} className={trim} />
              <IconGallery />
            </section>
          </div>
        </main>

        <aside className="sticky top-(--header-height) hidden h-[calc(100dvh-var(--header-height))] w-64 shrink-0 overflow-y-auto py-10 pr-6 pl-2 xl:block">
          <Toc items={GUIDE_TOC} />
        </aside>
      </div>
    </div>
  )
}
