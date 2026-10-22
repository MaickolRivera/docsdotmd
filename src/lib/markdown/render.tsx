import type { Element } from "hast"
import Link from "next/link"
import type { ComponentProps } from "react"
import Markdown, { defaultUrlTransform, type Components, type ExtraProps } from "react-markdown"
import type { PluggableList } from "unified"

import { DocAccordion } from "@/components/docs/accordion"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"
import { CodeTabs } from "@/components/docs/code-tabs"
import { Column, Columns } from "@/components/docs/columns"
import { DocButton } from "@/components/docs/doc-button"
import { DocCard } from "@/components/docs/doc-card"
import { Step, Steps } from "@/components/docs/steps"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { languageLabel, rehypeHighlightCode } from "./highlight"
import { normalizeDirectiveFences } from "./normalize"
import { rehypeSafePlugins, remarkPlugins } from "./pipeline"

// Renderizador único de markdown: lo usan el lector (Server Component) y la
// vista previa del editor (Client Component), así lo que se ve al editar es
// exactamente lo que se publica.

const rehypePlugins: PluggableList = [...rehypeSafePlugins, rehypeHighlightCode]

type WithNode<P> = P & ExtraProps
type DirectiveProps = WithNode<{ children?: React.ReactNode } & Record<string, unknown>>

function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined
}

function codeTabTitles(node: Element | undefined): string[] {
  return (node?.children ?? [])
    .filter((child): child is Element => child.type === "element" && child.tagName === "pre")
    .map((pre) => str(pre.properties.dataTitle) ?? languageLabel(str(pre.properties.dataLanguage)))
}

function DocLink({ node: _node, href = "", children, ...props }: WithNode<ComponentProps<"a">>) {
  // Adjuntos (/api/adjuntos/...) y enlaces externos se abren en otra pestaña.
  if (href.startsWith("/api/") || /^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

function DocImage({ node: _node, src, alt, ...props }: WithNode<ComponentProps<"img">>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imágenes de los usuarios, de tamaño desconocido y servidas con enlaces firmados
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

function DocTable({ node: _node, ...props }: WithNode<ComponentProps<"table">>) {
  return (
    <div className="my-6 overflow-x-auto">
      <table {...props} className={cn("my-0", props.className)} />
    </div>
  )
}

const components = {
  a: DocLink,
  img: DocImage,
  table: DocTable,
  pre: CodeBlock,
  "docs-steps": ({ children }: DirectiveProps) => <Steps>{children}</Steps>,
  "docs-step": ({ children }: DirectiveProps) => <Step>{children}</Step>,
  "docs-code-tabs": ({ node, children }: DirectiveProps) => (
    <CodeTabs titles={codeTabTitles(node)}>{children}</CodeTabs>
  ),
  "docs-callout": ({ type, title, children }: DirectiveProps) => (
    <Callout type={type} title={str(title)}>
      {children}
    </Callout>
  ),
  "docs-accordion": ({ title, children }: DirectiveProps) => (
    <DocAccordion title={str(title)}>{children}</DocAccordion>
  ),
  "docs-card": ({ title, icon, href, children }: DirectiveProps) => (
    <DocCard title={str(title)} icon={str(icon)} href={str(href)}>
      {children}
    </DocCard>
  ),
  "docs-button": ({ href, variant, children }: DirectiveProps) => (
    <DocButton href={str(href)} variant={str(variant)}>
      {children}
    </DocButton>
  ),
  "docs-columns": ({ children }: DirectiveProps) => <Columns>{children}</Columns>,
  "docs-column": ({ children }: DirectiveProps) => <Column>{children}</Column>,
} as Components

export function DocsMarkdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn("docs-content prose max-w-none prose-zinc dark:prose-invert", className)}>
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        remarkRehypeOptions={{
          footnoteLabel: t.docs.footnotes,
          footnoteBackLabel: t.docs.footnoteBack,
        }}
        components={components}
        urlTransform={defaultUrlTransform}
      >
        {normalizeDirectiveFences(source)}
      </Markdown>
    </div>
  )
}
