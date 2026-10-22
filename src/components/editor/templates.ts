import {
  ChevronsUpDown,
  Columns2,
  Info,
  ListOrdered,
  MousePointerClick,
  RectangleHorizontal,
  SquareCode,
  type LucideIcon,
} from "lucide-react"

import { t } from "@/lib/i18n"

export type ComponentTemplate = {
  /** Lo que se escribe después de "/" para encontrarlo. */
  key: string
  label: string
  description: string
  icon: LucideIcon
  text: string
  /** Los botones van dentro de la línea; el resto como bloque. */
  inline?: boolean
}

const c = t.editor.components
const tpl = t.editor.templates

/** Componentes del menú "Insertar componente" y del comando "/". */
export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  { key: "pasos", icon: ListOrdered, ...c.steps, text: tpl.steps },
  { key: "codigo", icon: SquareCode, ...c.codeTabs, text: tpl.codeTabs },
  { key: "aviso", icon: Info, ...c.callout, text: tpl.callout },
  { key: "acordeon", icon: ChevronsUpDown, ...c.accordion, text: tpl.accordion },
  { key: "tarjeta", icon: RectangleHorizontal, ...c.card, text: tpl.card },
  { key: "boton", icon: MousePointerClick, ...c.button, text: tpl.button, inline: true },
  { key: "columnas", icon: Columns2, ...c.columns, text: tpl.columns },
]
