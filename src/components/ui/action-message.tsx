import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionMessageTone = "error" | "success" | "info";

const toneClassNames: Record<ActionMessageTone, string> = {
  error: "border-destructive/20 bg-destructive/5 text-destructive",
  success: "border-primary/20 bg-primary/5 text-primary",
  info: "border-border bg-muted text-muted-foreground",
};

export function ActionMessage({
  children,
  className,
  tone = "error",
}: {
  children: ReactNode;
  className?: string;
  tone?: ActionMessageTone;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
