import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export default function LandingPage() {
  return (
    // data-header="compact": header de una fila (ver --header-height en globals.css).
    <div data-header="compact" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label={t.common.appName}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
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
          <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
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
              <Link href="/login">{t.landing.ctaSecondary}</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {t.landing.featuresTitle}
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">{t.landing.featuresSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.landing.features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{feature.title}</h3>
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
