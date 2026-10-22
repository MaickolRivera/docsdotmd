import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SettingsSection({
  title,
  description,
  action,
  children,
  danger,
}: {
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  danger?: boolean
}) {
  return (
    <Card className={cn(danger && "ring-destructive/30")}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle className={cn(danger && "text-destructive")}>
            <h2>{title}</h2>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  )
}
