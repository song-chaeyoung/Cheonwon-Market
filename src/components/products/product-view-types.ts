import type { Product } from "@/server/products/types";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CONDITION_LABELS,
  PRICE_LABELS,
} from "@/server/products/constants";

export type ProductForView = Product;
export type PersonName = Product["sellerName"];
export type PriceOption = Product["price"];
export type ProductStatus = Product["status"];
export type ProductCategory = Product["category"];
export type ProductCondition = Product["condition"];

export type ActionResult = {
  ok?: boolean;
  message: string;
  fieldErrors?: Record<string, string | string[]>;
};

export const CATEGORY_LABELS = PRODUCT_CATEGORY_LABELS;
export const CONDITION_LABELS = PRODUCT_CONDITION_LABELS;
export const PRICE_DISPLAY_LABELS = PRICE_LABELS;

export const CATEGORY_OPTIONS = [
  "clothes",
  "electronics",
  "books",
  "living",
  "hobby",
  "etc",
] as const satisfies readonly ProductCategory[];

export const CONDITION_OPTIONS = [
  "like_new",
  "good",
  "used",
  "flawed",
] as const satisfies readonly ProductCondition[];

export const NONE_PURCHASER_VALUE = "__none__";
