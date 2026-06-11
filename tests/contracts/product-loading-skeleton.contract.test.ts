import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const appLoadingPath = resolve("src/app/loading.tsx");
const skeletonPath = resolve("src/components/products/product-card-skeleton.tsx");
const productListPath = resolve("src/components/products/product-list.tsx");

describe("product loading skeleton contract", () => {
  it("reuses the product card skeleton for initial route and in-list loading", () => {
    expect(existsSync(skeletonPath)).toBe(true);
    expect(existsSync(appLoadingPath)).toBe(true);

    const skeletonSource = readFileSync(skeletonPath, "utf8");
    const appLoadingSource = readFileSync(appLoadingPath, "utf8");
    const productListSource = readFileSync(productListPath, "utf8");

    expect(skeletonSource).toContain("export function ProductCardSkeleton");
    expect(skeletonSource).toContain("aspect-square");
    expect(skeletonSource).toContain("animate-pulse");
    expect(appLoadingSource).toContain("ProductCardSkeleton");
    expect(appLoadingSource).toContain('role="status"');
    expect(productListSource).toContain("ProductCardSkeleton");
    expect(productListSource).toContain('className="sr-only" role="status"');
  });
});
