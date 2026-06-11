import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";

const productSkeletonItems = [0, 1, 2, 3, 4, 5];

export default function Loading() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-12 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-7 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-52 max-w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-28" />
        </header>
        <span className="sr-only" role="status">
          Loading products
        </span>
        <section
          aria-hidden="true"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {productSkeletonItems.map((item) => (
            <ProductCardSkeleton key={item} />
          ))}
        </section>
      </div>
    </main>
  );
}
