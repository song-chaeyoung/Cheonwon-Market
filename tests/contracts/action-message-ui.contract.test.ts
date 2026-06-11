import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const actionMessagePath = resolve("src/components/ui/action-message.tsx");
const targetPaths = [
  "src/components/access/access-code-screen.tsx",
  "src/components/products/delete-product-dialog.tsx",
  "src/components/products/image-uploader.tsx",
  "src/components/products/password-confirm-dialog.tsx",
  "src/components/products/product-form.tsx",
  "src/components/products/product-status-control.tsx",
  "src/components/products/reservation-select.tsx",
];

describe("action message UI contract", () => {
  it("uses one shared message component for action feedback", () => {
    expect(existsSync(actionMessagePath)).toBe(true);

    const actionMessageSource = readFileSync(actionMessagePath, "utf8");

    expect(actionMessageSource).toContain("export function ActionMessage");
    expect(actionMessageSource).toContain("tone");
    expect(actionMessageSource).toContain("error");
    expect(actionMessageSource).toContain("success");
    expect(actionMessageSource).toContain("info");
    expect(actionMessageSource).toContain('role={tone === "error" ? "alert" : "status"}');

    for (const targetPath of targetPaths) {
      const source = readFileSync(resolve(targetPath), "utf8");

      expect(source).toContain("@/components/ui/action-message");
      expect(source).toContain("ActionMessage");
      expect(source).not.toContain(
        "rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive",
      );
      expect(source).not.toContain(
        "rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground",
      );
    }
  });
});
