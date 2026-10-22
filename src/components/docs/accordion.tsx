import type { ReactNode } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

/** `:::accordion{title="..."}` — fila con chevron y borde que se despliega. */
export function DocAccordion({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <Accordion
      type="single"
      collapsible
      // Radix envuelve el disparador en un <h3>: se le quitan los estilos de
      // typography para que no parezca un título del contenido.
      className="my-3 rounded-xl border bg-card/40 px-4 [&_h3]:m-0 [&_h3]:text-[0.9375rem] [&_h3]:leading-6 [&_h3]:font-medium"
    >
      <AccordionItem value="item" className="border-none">
        <AccordionTrigger className="py-3.5 text-[0.9375rem] font-medium text-foreground hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent className="pb-1 text-[0.9375rem] [&>:first-child]:mt-0">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
