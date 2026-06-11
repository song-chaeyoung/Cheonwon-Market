import { withSubjectJosa } from "@/lib/korean-text";
import type { PersonName } from "@/server/products/constants";

import type { ProductForView } from "./product-view-types";

export const ALL_PERSON_FILTER_VALUE = "all";

export type PersonFilterValue =
  | typeof ALL_PERSON_FILTER_VALUE
  | PersonName;

export type ProductFilters = {
  freeOnly: boolean;
  unreservedOnly: boolean;
  sellerName: PersonFilterValue;
  purchaseName: PersonFilterValue;
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  freeOnly: false,
  unreservedOnly: false,
  sellerName: ALL_PERSON_FILTER_VALUE,
  purchaseName: ALL_PERSON_FILTER_VALUE,
};

export function personFilterSubjectLabel(value: PersonFilterValue) {
  return value === ALL_PERSON_FILTER_VALUE ? "전체" : withSubjectJosa(value);
}

function matchesPersonFilter(
  filterValue: PersonFilterValue,
  productValue: PersonName | null,
) {
  return filterValue === ALL_PERSON_FILTER_VALUE || productValue === filterValue;
}

export function filterProducts(
  products: readonly ProductForView[],
  filters: ProductFilters,
) {
  return products.filter((product) => {
    if (filters.freeOnly && product.price !== 0) {
      return false;
    }

    if (filters.unreservedOnly && product.status !== "available") {
      return false;
    }

    if (!matchesPersonFilter(filters.sellerName, product.sellerName)) {
      return false;
    }

    return matchesPersonFilter(filters.purchaseName, product.purchaseName);
  });
}
