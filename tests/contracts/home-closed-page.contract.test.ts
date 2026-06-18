import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("home closed page contract", () => {
  const source = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

  it("shows the temporary closure message on the home page", () => {
    expect(source).toContain("다음 만남까지 잠시 닫아둡니다.");
  });

  it("does not depend on environment-backed server modules", () => {
    expect(source).not.toContain("@/server/access");
    expect(source).not.toContain("@/server/products/repository");
    expect(source).not.toContain("@/components/products/product-list");
  });

  it("keeps the closed page compact and centered on mobile", () => {
    expect(source).toContain("min-h-[100svh]");
    expect(source).toContain("w-full max-w-2xl text-center");
    expect(source).not.toContain("text-left sm:text-center");
    expect(source).toContain("text-3xl");
    expect(source).toContain("min-w-0");
    expect(source).not.toContain("찾아와 주셔서 고맙습니다");
  });
});
