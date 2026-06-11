import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sourcePath = resolve("src/components/products/product-filter-controls.tsx");

describe("product filter UI contract", () => {
  it("uses checkboxes for boolean filters and inline selects for person filters without a result count", () => {
    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain('type="checkbox"');
    expect(source).toContain("공짜만 보기");
    expect(source).toContain("예약 안 된 것만");
    expect(source).toContain("등록한 상품");
    expect(source).toContain("예약한 상품");
    expect(source).toContain("personFilterSubjectLabel");
    expect(source).not.toContain("withSubjectJosa");
    expect(source).not.toContain("(이)가");
    expect(source).toContain("<SelectTrigger");
    expect(source).toContain('<SelectContent position="popper" align="start">');
    expect(source).not.toContain("visibleCount");
    expect(source).not.toContain("totalCount");
  });
});
