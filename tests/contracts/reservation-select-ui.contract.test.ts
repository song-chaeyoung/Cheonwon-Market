import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sourcePath = resolve("src/components/products/reservation-select.tsx");

describe("reservation select UI contract", () => {
  it("uses popper positioning for the inline reservation menu", () => {
    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain('<SelectContent position="popper" align="start">');
  });
});
