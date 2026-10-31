import type { ReactNode } from "react";
import CommandShell from "@/components/layout/CommandShell";

export default function CommandLayout({ children }: { children: ReactNode }) {
  return <CommandShell>{children}</CommandShell>;
}
