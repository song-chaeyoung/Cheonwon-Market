export const PRICE_OPTIONS = [0, 500, 1000] as const;

export const PRICE_LABELS = {
  0: "공짜",
  500: "500원",
  1000: "1,000원",
} as const;

export const PRODUCT_STATUSES = ["available", "reserved", "completed"] as const;

export const PRODUCT_STATUS_LABELS = {
  available: "판매중",
  reserved: "예약중",
  completed: "거래완료",
} as const;

export const PRODUCT_CATEGORIES = [
  "clothes",
  "electronics",
  "books",
  "living",
  "hobby",
  "etc",
] as const;

export const PRODUCT_CATEGORY_LABELS = {
  clothes: "의류",
  electronics: "전자기기",
  books: "책",
  living: "생활",
  hobby: "취미",
  etc: "기타",
} as const;

export const PRODUCT_CONDITIONS = [
  "like_new",
  "good",
  "used",
  "flawed",
] as const;

export const PRODUCT_CONDITION_LABELS = {
  like_new: "거의 새것",
  good: "좋음",
  used: "사용감 있음",
  flawed: "흠 있음",
} as const;

export const PERSON_NAMES = ["채영", "유나", "비주"] as const;

export const DEFAULT_PRODUCT_CATEGORY = "etc";
export const DEFAULT_PRODUCT_CONDITION = "used";

export const VALID_STATUS_TRANSITIONS = {
  available: ["reserved", "completed"],
  reserved: ["available", "completed"],
  completed: [],
} as const;

export function canTransitionStatus(
  from: ProductStatus,
  to: ProductStatus,
): boolean {
  return (VALID_STATUS_TRANSITIONS[from] as readonly ProductStatus[]).includes(
    to,
  );
}

export type PriceOption = (typeof PRICE_OPTIONS)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];
export type PersonName = (typeof PERSON_NAMES)[number];
