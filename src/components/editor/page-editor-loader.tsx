"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

import type { PageEditorProps } from "./page-editor"

// CodeMirror y el borrador local (localStorage) solo existen en el navegador.
const PageEditor = dynamic(() => import("./page-editor").then((mod) => mod.PageEditor), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[60vh] w-full" />
    </div>
  ),
})

export function PageEditorLoader(props: PageEditorProps) {
  return <PageEditor {...props} />
}
