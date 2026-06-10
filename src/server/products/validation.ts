import {
  DEFAULT_PRODUCT_CATEGORY,
  DEFAULT_PRODUCT_CONDITION,
  PERSON_NAMES,
  PRICE_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  type PersonName,
  type PriceOption,
  type ProductCategory,
  type ProductCondition,
  type ProductStatus,
} from "./constants";
import type { ProductCreateInput, ProductUpdateInput } from "./types";

export const PRODUCT_ERROR_MESSAGES = {
  invalidImages: "이미지는 1장 이상 5장 이하로 올려주세요.",
  invalidPassword: "수정 비밀번호가 일치하지 않아요.",
  completedReservation: "거래가 완료된 상품은 예약자를 바꿀 수 없어요.",
  completedStatus: "거래가 완료된 상품은 상태를 바꿀 수 없어요.",
  reservationChanged: "예약자가 변경되었어요.",
  saved: "상품이 저장되었어요.",
  deleted: "상품을 삭제했어요.",
  invalidInput: "입력값을 다시 확인해주세요.",
} as const;

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

const isOneOf = <T extends readonly unknown[]>(
  values: T,
  value: unknown,
): value is T[number] => values.includes(value);

export function isPersonName(value: unknown): value is PersonName {
  return isOneOf(PERSON_NAMES, value);
}

export function isProductStatus(value: unknown): value is ProductStatus {
  return isOneOf(PRODUCT_STATUSES, value);
}

export function parsePurchaseName(value: unknown): PersonName | null {
  if (value === null || value === "" || value === "none") {
    return null;
  }

  return isPersonName(value) ? value : null;
}

const parsePrice = (value: FormDataEntryValue | null): PriceOption | null => {
  const numberValue = Number(value);
  return isOneOf(PRICE_OPTIONS, numberValue) ? numberValue : null;
};

const parseCategory = (
  value: FormDataEntryValue | null,
): ProductCategory | null => {
  if (value === null || value === "") {
    return DEFAULT_PRODUCT_CATEGORY;
  }

  return isOneOf(PRODUCT_CATEGORIES, value) ? value : null;
};

const parseCondition = (
  value: FormDataEntryValue | null,
): ProductCondition | null => {
  if (value === null || value === "") {
    return DEFAULT_PRODUCT_CONDITION;
  }

  return isOneOf(PRODUCT_CONDITIONS, value) ? value : null;
};

const optionalText = (value: FormDataEntryValue | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const requiredText = (value: FormDataEntryValue | null): string | null => {
  const text = optionalText(value);
  return text && text.length > 0 ? text : null;
};

export function imageUrlsFromFormData(formData: FormData): string[] {
  const values = formData.getAll("imageUrls").flatMap((value) => {
    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();
    if (trimmed === "") {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [];
      } catch {
        return [];
      }
    }

    return [trimmed];
  });

  return [...new Set(values)];
}

export function parseCreateProductFormData(
  formData: FormData,
): ValidationResult<ProductCreateInput> {
  const title = requiredText(formData.get("title"));
  const price = parsePrice(formData.get("price"));
  const category = parseCategory(formData.get("category"));
  const condition = parseCondition(formData.get("condition"));
  const sellerName = formData.get("sellerName");
  const editPassword = requiredText(formData.get("editPassword"));
  const imageUrls = imageUrlsFromFormData(formData);

  if (
    !title ||
    price === null ||
    !category ||
    !condition ||
    !isPersonName(sellerName) ||
    !editPassword ||
    imageUrls.length < 1 ||
    imageUrls.length > 5
  ) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  return {
    ok: true,
    value: {
      title,
      description: optionalText(formData.get("description")),
      price,
      category,
      condition,
      imageUrls,
      sellerName,
      flawNote: optionalText(formData.get("flawNote")),
      editPassword,
    },
  };
}

export function parseUpdateProductFormData(
  formData: FormData,
): ValidationResult<ProductUpdateInput> {
  const parsed = parseCreateProductFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const value: ProductUpdateInput = {
    title: parsed.value.title,
    description: parsed.value.description,
    price: parsed.value.price,
    category: parsed.value.category,
    condition: parsed.value.condition,
    imageUrls: parsed.value.imageUrls,
    sellerName: parsed.value.sellerName,
    flawNote: parsed.value.flawNote,
  };

  return { ok: true, value };
}
