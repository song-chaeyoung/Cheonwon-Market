"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { EmptyProducts } from "./empty-products";
import { ProductEmptyState } from "./product-empty-state";
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
        <ProductEmptyState
          title="조건에 맞는 상품이 없어요."
          description="필터를 초기화하면 다시 전체 상품을 볼 수 있어요."
          action={
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              onClick={() => setFilters(DEFAULT_PRODUCT_FILTERS)}
            >
              필터 초기화
            </Button>
          }
        />
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
