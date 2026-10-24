import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { ProductDemo } from "@/components/landing/product-demo"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { DocIcon } from "@/lib/icons"
import { DEMO_PAGES, DEMO_SPACES } from "@/lib/landing-demo"
import { DocsMarkdown } from "@/lib/markdown/render"
import { getToc } from "@/lib/markdown/toc"

export default function LandingPage() {
  // La demo se renderiza aquí, en el servidor, con el mismo renderizador e
  // iconos que la app; al navegador solo llega el resultado.
  const demoSpaces = DEMO_SPACES.map((space) => ({
    ...space,
    icon: <DocIcon name={space.icon} className="size-3.5" />,
  }))
  const demoPages = DEMO_PAGES.map(({ source, ...page }) => ({
    ...page,
    toc: getToc(source),
    content: <DocsMarkdown source={source} />,
  }))

  return (
    <div data-header="compact" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center gap-4 px-4 md:justify-between">
          <Link href="/" aria-label={t.common.appName} className="hidden pt-2 md:block">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/orgs">{t.landing.ctaSecondary}</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/registro">{t.landing.ctaPrimary}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 pb-14 text-center md:py-18">
          <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {t.landing.title}
            <span className="text-primary">{t.landing.titleAccent}</span>
          </h1>

          <p className="mt-3 max-w-sm text-lg text-pretty text-muted-foreground">
            {t.landing.subtitle}
          </p>

          <Link
            href="/guia"
            className="group inline-flex items-center gap-2 rounded-full border bg-background px-3 mt-5 text-sm shadow-xs transition-colors hover:bg-muted/60"
          >
            <span className="pt-0.5 text-muted-foreground transition-colors group-hover:text-foreground">
              {t.landing.badge}
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        <section
          id="demo"
          aria-label={t.landing.demo.label}
          className="mx-auto flex max-w-6xl flex-col items-center px-4"
        >
          <ProductDemo spaces={demoSpaces} pages={demoPages} />
          <p className="mt-4 max-w-6xl text-center text-xs text-muted-foreground">
            {t.landing.demo.hint}
          </p>
        </section>

        <section id="funciones" className="mx-auto max-w-6xl px-4 py-40">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {t.landing.featuresTitle}
            </h2>
            <p className="mt-3 max-w-sm text-lg text-pretty text-muted-foreground">
              {t.landing.featuresSubtitle}
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.landing.features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DocIcon name={feature.icon} />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto text-xs flex h-14 max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/privacidad" className="hover:text-foreground">
              {t.legal.privacy}
            </Link>
            <Link href="/terminos" className="hover:text-foreground">
              {t.legal.terms}
            </Link>
          </nav>
          <div>
            <span>{t.landing.footer}</span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.maickolrivera.me/"
              className="text-primary"
            >
              Maickol Rivera
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
