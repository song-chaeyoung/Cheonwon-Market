import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const pagePath = resolve("src/app/page.tsx");

describe("product page pagination contract", () => {
  it("loads the first product page instead of the full product list", () => {
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain("listProductPage");
    expect(source).not.toContain("listProducts");
    expect(source).toContain("initialProducts=");
    expect(source).toContain("initialCursor=");
  });
});
