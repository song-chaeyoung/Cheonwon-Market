import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="h-full gap-3 rounded-lg py-0"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
        <div className="absolute left-2 top-2 h-5 w-14 animate-pulse rounded-full bg-background/80" />
      </div>
      <CardContent className="space-y-2 pb-4">
        <div className="min-w-0 space-y-2">
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
