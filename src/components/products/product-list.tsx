"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useCursorInfinite } from "@/hooks/use-cursor-infinite";

import { EmptyProducts } from "./empty-products";
import { ProductEmptyState } from "./product-empty-state";
import { ProductFilterControls } from "./product-filter-controls";
import {
  ALL_PERSON_FILTER_VALUE,
  DEFAULT_PRODUCT_FILTERS,
  type ProductFilters,
} from "./product-filters";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { ProductDetailDialog } from "./product-detail-dialog";
import type { ProductForView } from "./product-view-types";

type ProductListProps = {
  initialProducts: ProductForView[];
  initialCursor: string | null;
};

type ProductPageResponse = {
  items: ProductForView[];
  nextCursor: string | null;
};

function filtersKey(filters: ProductFilters) {
  return JSON.stringify(filters);
}

function isDefaultFilters(filters: ProductFilters) {
  return filtersKey(filters) === filtersKey(DEFAULT_PRODUCT_FILTERS);
}

function productPageUrl(cursor: string | null, filters: ProductFilters) {
  const params = new URLSearchParams();

  if (cursor) {
    params.set("cursor", cursor);
  }

  if (filters.freeOnly) {
    params.set("freeOnly", "true");
  }

  if (filters.unreservedOnly) {
    params.set("unreservedOnly", "true");
  }

  if (filters.sellerName !== ALL_PERSON_FILTER_VALUE) {
    params.set("sellerName", filters.sellerName);
  }

  if (filters.purchaseName !== ALL_PERSON_FILTER_VALUE) {
    params.set("purchaseName", filters.purchaseName);
  }

  const query = params.toString();

  return query ? `/api/products?${query}` : "/api/products";
}

export function ProductList({
  initialProducts,
  initialCursor,
}: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>(
    DEFAULT_PRODUCT_FILTERS,
  );
  const resetKey = useMemo(() => filtersKey(filters), [filters]);
  const usesInitialPage = isDefaultFilters(filters);
  const getNextPage = useCallback(
    async (cursor: string | null, signal: AbortSignal) => {
      const response = await fetch(productPageUrl(cursor, filters), { signal });

      if (!response.ok) {
        throw new Error("상품을 불러오지 못했습니다.");
      }

      return (await response.json()) as ProductPageResponse;
    },
    [filters],
  );
  const {
    items: products,
    sentinelRef,
    isLoading,
    hasNextPage,
    error,
    loadMore,
  } = useCursorInfinite({
    initialItems: usesInitialPage ? initialProducts : [],
    initialCursor: usesInitialPage ? initialCursor : null,
    getNextPage,
    resetKey,
    autoLoadFirstPage: !usesInitialPage,
  });

  if (initialProducts.length === 0) {
    return <EmptyProducts />;
  }

  const showEmptyFilterResult =
    products.length === 0 && !hasNextPage && !isLoading && !error;
  const loadingSkeletonCount = products.length > 0 ? 3 : 6;

  return (
    <div className="space-y-4">
      <ProductFilterControls
        filters={filters}
        onFiltersChange={setFilters}
      />
      {showEmptyFilterResult ? (
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
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Dialog key={product.id}>
                <DialogTrigger className="h-full rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <ProductCard product={product} />
                </DialogTrigger>
                <ProductDetailDialog product={product} />
              </Dialog>
            ))}
            {isLoading
              ? Array.from({ length: loadingSkeletonCount }, (_, index) => (
                  <ProductCardSkeleton key={`loading-${index}`} />
                ))
              : null}
          </section>
          {hasNextPage ? (
            <div ref={sentinelRef} aria-hidden="true" className="h-3" />
          ) : null}
          {isLoading ? (
            <p className="sr-only" role="status">
              상품을 불러오는 중...
            </p>
          ) : null}
          {error ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm">
              <p className="text-destructive">{error.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void loadMore();
                }}
              >
                다시 시도
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
