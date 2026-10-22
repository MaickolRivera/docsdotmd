import { ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

import { ProductDemo } from "@/components/landing/product-demo"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { DocIcon } from "@/lib/icons"
import { DEMO_PAGES, DEMO_SPACES } from "@/lib/landing-demo"
import { DocsMarkdown } from "@/lib/markdown/render"
import { getToc } from "@/lib/markdown/toc"

const navLinkClass = "rounded-full text-muted-foreground hover:text-foreground"

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
    // data-header="compact": header de una fila (ver --header-height en globals.css).
    <div data-header="compact" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label={t.common.appName} className="justify-self-start">
            <Logo />
          </Link>
          <nav aria-label={t.landing.nav.label} className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="sm" className={navLinkClass}>
              <a href="#demo">{t.landing.nav.demo}</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className={navLinkClass}>
              <a href="#funciones">{t.landing.nav.features}</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className={navLinkClass}>
              <Link href="/guia">{t.landing.nav.guide}</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2 justify-self-end">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link href="/login">{t.landing.ctaSecondary}</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/registro">{t.landing.ctaPrimary}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 pb-14 text-center md:pt-24 md:pb-20">
          <Link
            href="/guia"
            className="group inline-flex items-center gap-2 rounded-full border bg-background py-1 pr-3 pl-1 text-sm shadow-xs transition-colors hover:bg-muted/60"
          >
            <Badge className="rounded-full">{t.landing.badgeNew}</Badge>
            <span className="text-muted-foreground transition-colors group-hover:text-foreground">
              {t.landing.badge}
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
          <h1 className="mt-7 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {t.landing.title} <span className="text-primary">{t.landing.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            {t.landing.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href="/registro">
                {t.landing.ctaPrimary}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-5">
              <Link href="/guia">
                <BookOpen data-icon="inline-start" />
                {t.landing.ctaGuide}
              </Link>
            </Button>
          </div>
        </section>

        <section id="demo" aria-label={t.landing.demo.label} className="mx-auto max-w-6xl px-4">
          <ProductDemo spaces={demoSpaces} pages={demoPages} />
          <p className="mt-4 text-center text-sm text-muted-foreground">{t.landing.demo.hint}</p>
        </section>

        <section id="funciones" className="mx-auto max-w-6xl px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {t.landing.featuresTitle}
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">{t.landing.featuresSubtitle}</p>
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <Logo className="text-foreground" />
          <span>{t.landing.footer}</span>
        </div>
      </footer>
    </div>
  )
}
