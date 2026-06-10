import { describe, expect, it, vi } from "vitest";

import { createProductService } from "../../src/server/products/service";

const product = {
  id: "product-1",
  title: "머그컵",
  description: null,
  price: 1000,
  category: "etc",
  condition: "used",
  status: "available",
  imageUrls: ["https://blob.example/mug.png"],
  sellerName: "채영",
  purchaseName: null,
  flawNote: null,
  createdAt: "2026-06-10T00:00:00.000Z",
  updatedAt: "2026-06-10T00:00:00.000Z",
} as const;

describe("product service action contract", () => {
  it("changes reservation without requiring the product edit password", async () => {
    const updateReservation = vi.fn().mockResolvedValue({
      ...product,
      status: "reserved",
      purchaseName: "유나",
    });
    const service = createProductService({
      repository: {
        updateReservation,
      },
    });

    await expect(
      service.changeReservation("product-1", "유나"),
    ).resolves.toEqual({
      ok: true,
      message: "예약자가 변경되었어요.",
    });
    expect(updateReservation).toHaveBeenCalledWith("product-1", "유나");
  });

  it("returns the completed-product message when reservation changes affect no row", async () => {
    const service = createProductService({
      repository: {
        updateReservation: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(
      service.changeReservation("product-1", "비주"),
    ).resolves.toEqual({
      ok: false,
      message: "거래가 완료된 상품은 예약자를 바꿀 수 없어요.",
    });
  });

  it("rejects password-protected mutations when the edit password does not match", async () => {
    const service = createProductService({
      repository: {
        getProductPasswordHash: vi.fn().mockResolvedValue("scrypt:salt:hash"),
        updateProduct: vi.fn(),
      },
      password: {
        verifyPassword: vi.fn().mockResolvedValue(false),
      },
    });

    await expect(
      service.updateProduct("product-1", { title: "새 제목" }, "wrong-password"),
    ).resolves.toEqual({
      ok: false,
      message: "수정 비밀번호가 일치하지 않아요.",
    });
  });

  it("prevents completed products from reverting to another status", async () => {
    const service = createProductService({
      repository: {
        getProductById: vi.fn().mockResolvedValue({
          ...product,
          status: "completed",
        }),
      },
    });

    await expect(
      service.changeStatus("product-1", "available", "password"),
    ).resolves.toEqual({
      ok: false,
      message: "거래가 완료된 상품은 상태를 바꿀 수 없어요.",
    });
  });

  it("does not set reserved status directly when no purchaser exists", async () => {
    const updateProductStatus = vi.fn();
    const service = createProductService({
      repository: {
        getProductById: vi.fn().mockResolvedValue(product),
        updateProductStatus,
      },
    });

    await expect(
      service.changeStatus("product-1", "reserved", "password"),
    ).resolves.toEqual({
      ok: false,
      message: "입력값을 다시 확인해주세요.",
    });
    expect(updateProductStatus).not.toHaveBeenCalled();
  });

  it("attempts to clean uploaded images when product creation fails", async () => {
    const error = new Error("database insert failed");
    const deleteProductImages = vi.fn().mockResolvedValue(undefined);
    const service = createProductService({
      repository: {
        createProduct: vi.fn().mockRejectedValue(error),
      },
      password: {
        hashPassword: vi.fn().mockResolvedValue("scrypt:salt:hash"),
      },
      images: {
        deleteProductImages,
      },
    });

    await expect(
      service.createProduct({
        title: "머그컵",
        description: null,
        price: 1000,
        category: "etc",
        condition: "used",
        imageUrls: ["https://blob.example/mug.png"],
        sellerName: "채영",
        flawNote: null,
        editPassword: "secret",
      }),
    ).rejects.toThrow(error);
    expect(deleteProductImages).toHaveBeenCalledWith([
      "https://blob.example/mug.png",
    ]);
  });
});
