import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const emptyStatePath = resolve(
  "src/components/products/product-empty-state.tsx",
);
const emptyProductsPath = resolve("src/components/products/empty-products.tsx");
const productListPath = resolve("src/components/products/product-list.tsx");

describe("product empty state UI contract", () => {
  it("uses one shared empty-state component for empty lists and empty filter results", () => {
    const emptyStateSource = readFileSync(emptyStatePath, "utf8");
    const emptyProductsSource = readFileSync(emptyProductsPath, "utf8");
    const productListSource = readFileSync(productListPath, "utf8");

    expect(emptyStateSource).toContain("export function ProductEmptyState");
    expect(emptyStateSource).toContain("action");
    expect(emptyProductsSource).toContain("ProductEmptyState");
    expect(emptyProductsSource).toContain("상품 올리기");
    expect(productListSource).toContain("ProductEmptyState");
    expect(productListSource).toContain("필터 초기화");
    expect(productListSource).toContain('variant="link"');
    expect(productListSource).toContain('className="h-auto px-0"');
    expect(productListSource).toContain("setFilters(DEFAULT_PRODUCT_FILTERS)");
    expect(productListSource).toContain(
      "필터를 초기화하면 다시 전체 상품을 볼 수 있어요.",
    );
  });
});
