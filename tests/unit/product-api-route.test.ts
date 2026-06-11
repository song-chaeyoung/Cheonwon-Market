import { beforeEach, describe, expect, it, vi } from "vitest";

const { listProductPage, requireMarketAccess } = vi.hoisted(() => ({
  listProductPage: vi.fn(),
  requireMarketAccess: vi.fn(),
}));

vi.mock("../../src/server/access", async () => {
  class MarketAccessError extends Error {
    constructor(message?: string) {
      super(message);
    }
  }

  return {
    MarketAccessError,
    requireMarketAccess,
  };
});

vi.mock("../../src/server/products/repository", () => ({
  listProductPage,
}));

import { MarketAccessError } from "../../src/server/access";
import { PERSON_NAMES } from "../../src/server/products/constants";
import { encodeProductCursor } from "../../src/server/products/pagination";
import { GET } from "../../src/app/api/products/route";

describe("products API route", () => {
  beforeEach(() => {
    requireMarketAccess.mockReset();
    listProductPage.mockReset();
    listProductPage.mockResolvedValue({
      items: [],
      nextCursor: null,
    });
  });

  it("returns 401 when market access is missing", async () => {
    const error = new MarketAccessError();
    requireMarketAccess.mockRejectedValue(error);

    const response = await GET(new Request("https://example.test/api/products"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: error.message });
    expect(listProductPage).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed cursor and filter values", async () => {
    const cursorResponse = await GET(
      new Request("https://example.test/api/products?cursor=broken"),
    );
    const filterResponse = await GET(
      new Request("https://example.test/api/products?freeOnly=yes"),
    );

    expect(cursorResponse.status).toBe(400);
    expect(filterResponse.status).toBe(400);
    expect(listProductPage).not.toHaveBeenCalled();
  });

  it("returns 400 for a cursor id that is not a UUID", async () => {
    const params = new URLSearchParams({
      cursor: encodeProductCursor({
        createdAt: "2026-06-11T01:02:03.000Z",
        id: "not-a-uuid",
      }),
    });

    const response = await GET(
      new Request(`https://example.test/api/products?${params.toString()}`),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Malformed product cursor",
    });
    expect(listProductPage).not.toHaveBeenCalled();
  });

  it("passes cursor and filters to the paginated repository query", async () => {
    const cursor = {
      createdAt: "2026-06-11T01:02:03.000Z",
      id: "018f3f3c-8a68-7f62-9f3a-1a2b3c4d5e6f",
    };
    const [sellerName] = PERSON_NAMES;
    const params = new URLSearchParams({
      cursor: encodeProductCursor(cursor),
      freeOnly: "true",
      unreservedOnly: "true",
      sellerName,
      purchaseName: "all",
    });

    const response = await GET(
      new Request(`https://example.test/api/products?${params.toString()}`),
    );

    expect(response.status).toBe(200);
    expect(listProductPage).toHaveBeenCalledWith({
      limit: 24,
      cursor,
      filters: {
        freeOnly: true,
        unreservedOnly: true,
        sellerName,
        purchaseName: "all",
      },
    });
    expect(await response.json()).toEqual({ items: [], nextCursor: null });
  });

  it("does not convert repository failures into malformed request responses", async () => {
    listProductPage.mockRejectedValue(new Error("db down"));

    await expect(
      GET(new Request("https://example.test/api/products")),
    ).rejects.toThrow("db down");
  });
});
