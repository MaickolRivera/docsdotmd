import { CenteredShell } from "@/components/layout/centered-shell"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <CenteredShell>{children}</CenteredShell>
}
