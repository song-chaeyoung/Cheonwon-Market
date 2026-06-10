import { describe, expect, it, vi } from "vitest";

import { deleteProductImages } from "../../src/server/images/blob";

describe("blob storage contract", () => {
  it("does not throw when blob deletion fails during product cleanup", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(
      deleteProductImages(["https://blob.example/a.png"], {
        del: vi.fn().mockRejectedValue(new Error("blob delete failed")),
      }),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      "Failed to delete product image blob",
      expect.objectContaining({
        url: "https://blob.example/a.png",
        error: expect.any(Error),
      }),
    );

    warn.mockRestore();
  });
});
