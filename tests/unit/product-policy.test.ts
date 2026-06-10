import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRODUCT_CATEGORY,
  DEFAULT_PRODUCT_CONDITION,
  PERSON_NAMES,
  PRICE_LABELS,
  PRICE_OPTIONS,
  PRODUCT_STATUS_LABELS,
  VALID_STATUS_TRANSITIONS,
  canTransitionStatus,
} from "../../src/server/products/constants";

describe("product policy", () => {
  it("allows only the MVP fixed price options and Korean labels", () => {
    expect(PRICE_OPTIONS).toEqual([0, 500, 1000]);
    expect(PRICE_LABELS).toEqual({
      0: "공짜",
      500: "500원",
      1000: "1,000원",
    });
  });

  it("exposes the MVP status labels", () => {
    expect(PRODUCT_STATUS_LABELS).toEqual({
      available: "판매중",
      reserved: "예약중",
      completed: "거래완료",
    });
  });

  it("allows only reservation and completion transitions defined by the spec", () => {
    expect(VALID_STATUS_TRANSITIONS).toEqual({
      available: ["reserved", "completed"],
      reserved: ["available", "completed"],
      completed: [],
    });

    expect(canTransitionStatus("available", "reserved")).toBe(true);
    expect(canTransitionStatus("available", "completed")).toBe(true);
    expect(canTransitionStatus("reserved", "available")).toBe(true);
    expect(canTransitionStatus("reserved", "completed")).toBe(true);
    expect(canTransitionStatus("completed", "available")).toBe(false);
    expect(canTransitionStatus("completed", "reserved")).toBe(false);
  });

  it("keeps seller and purchaser names constrained to the friend group", () => {
    expect(PERSON_NAMES).toEqual(["채영", "유나", "비주"]);
  });

  it("uses server defaults for optional category and condition fields", () => {
    expect(DEFAULT_PRODUCT_CATEGORY).toBe("etc");
    expect(DEFAULT_PRODUCT_CONDITION).toBe("used");
  });
});
