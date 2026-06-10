import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { EmptyProducts } from "./empty-products";
import { ProductCard } from "./product-card";
import { ProductDetailDialog } from "./product-detail-dialog";
import type { ProductForView } from "./product-view-types";

export function ProductList({ products }: { products: ProductForView[] }) {
  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Dialog key={product.id}>
          <DialogTrigger className="h-full rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <ProductCard product={product} />
          </DialogTrigger>
          <ProductDetailDialog product={product} />
        </Dialog>
      ))}
    </section>
  );
}
