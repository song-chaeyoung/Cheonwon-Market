import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const pagePath = resolve("src/app/page.tsx");

describe("product page pagination contract", () => {
  it("does not load product pagination while the home page is temporarily closed", () => {
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain("다음 만남까지 잠시 닫아둡니다.");
    expect(source).not.toContain("listProductPage");
    expect(source).not.toContain("listProducts");
    expect(source).not.toContain("initialProducts=");
    expect(source).not.toContain("initialCursor=");
  });
});
