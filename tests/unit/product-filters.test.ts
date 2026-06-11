import { describe, expect, it } from "vitest";

import { PERSON_NAMES } from "../../src/server/products/constants";
import type { ProductForView } from "../../src/components/products/product-view-types";
import {
  ALL_PERSON_FILTER_VALUE,
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  personFilterSubjectLabel,
} from "../../src/components/products/product-filters";

const [chaeyoung, yuna, biju] = PERSON_NAMES;

function product(overrides: Partial<ProductForView>): ProductForView {
  return {
    id: overrides.id ?? "product-id",
    title: overrides.title ?? "상품",
    description: null,
    price: overrides.price ?? 1000,
    category: overrides.category ?? "etc",
    condition: overrides.condition ?? "used",
    status: overrides.status ?? "available",
    imageUrls: overrides.imageUrls ?? ["/image.png"],
    sellerName: overrides.sellerName ?? chaeyoung,
    purchaseName: overrides.purchaseName ?? null,
    flawNote: null,
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
  };
}

describe("product filters", () => {
  it("keeps all products when every filter is at its default", () => {
    const products = [
      product({ id: "free", price: 0 }),
      product({ id: "reserved", status: "reserved", purchaseName: yuna }),
    ];

    expect(filterProducts(products, DEFAULT_PRODUCT_FILTERS)).toEqual(products);
  });

  it("combines free, unreserved, seller, and purchaser filters", () => {
    const products = [
      product({
        id: "match",
        price: 0,
        status: "available",
        sellerName: chaeyoung,
        purchaseName: null,
      }),
      product({
        id: "paid",
        price: 1000,
        status: "available",
        sellerName: chaeyoung,
        purchaseName: null,
      }),
      product({
        id: "reserved",
        price: 0,
        status: "reserved",
        sellerName: chaeyoung,
        purchaseName: yuna,
      }),
      product({
        id: "seller",
        price: 0,
        status: "available",
        sellerName: biju,
        purchaseName: null,
      }),
    ];

    const result = filterProducts(products, {
      freeOnly: true,
      unreservedOnly: true,
      sellerName: chaeyoung,
      purchaseName: "all",
    });

    expect(result.map((item) => item.id)).toEqual(["match"]);
  });

  it("filters by purchaser name independently from the unreserved checkbox", () => {
    const products = [
      product({ id: "yuna", status: "reserved", purchaseName: yuna }),
      product({ id: "biju", status: "reserved", purchaseName: biju }),
      product({ id: "none", status: "available", purchaseName: null }),
    ];

    const result = filterProducts(products, {
      ...DEFAULT_PRODUCT_FILTERS,
      purchaseName: yuna,
    });

    expect(result.map((item) => item.id)).toEqual(["yuna"]);
  });

  it("omits the subject marker only from the all-person filter label", () => {
    expect(personFilterSubjectLabel(ALL_PERSON_FILTER_VALUE)).toBe("전체");
    expect(personFilterSubjectLabel(yuna)).toBe(`${yuna}가`);
    expect(personFilterSubjectLabel(chaeyoung)).toBe(`${chaeyoung}이가`);
  });
});
