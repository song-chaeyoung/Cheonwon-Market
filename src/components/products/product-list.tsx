"use client";

import { useMemo, useState } from "react";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { EmptyProducts } from "./empty-products";
import { ProductFilterControls } from "./product-filter-controls";
import {
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  type ProductFilters,
} from "./product-filters";
import { ProductCard } from "./product-card";
import { ProductDetailDialog } from "./product-detail-dialog";
import type { ProductForView } from "./product-view-types";

export function ProductList({ products }: { products: ProductForView[] }) {
  const [filters, setFilters] = useState<ProductFilters>(
    DEFAULT_PRODUCT_FILTERS,
  );
  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters],
  );

  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <div className="space-y-4">
      <ProductFilterControls
        filters={filters}
        onFiltersChange={setFilters}
      />
      {filteredProducts.length === 0 ? (
        <section className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-background px-4 py-10 text-center">
          <p className="text-lg font-semibold">조건에 맞는 상품이 없어요</p>
          <p className="text-sm text-muted-foreground">
            필터를 줄이면 다시 상품을 볼 수 있어요.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Dialog key={product.id}>
              <DialogTrigger className="h-full rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <ProductCard product={product} />
              </DialogTrigger>
              <ProductDetailDialog product={product} />
            </Dialog>
          ))}
        </section>
      )}
    </div>
  );
}
