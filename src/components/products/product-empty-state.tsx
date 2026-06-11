import type { ReactNode } from "react";

type ProductEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ProductEmptyState({
  title,
  description,
  action,
}: ProductEmptyStateProps) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center gap-5 rounded-lg border border-dashed bg-background px-4 py-12 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
