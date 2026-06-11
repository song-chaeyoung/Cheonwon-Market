import { beforeEach, describe, expect, it, vi } from "vitest";

import { PERSON_NAMES } from "../../src/server/products/constants";

const { query } = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../../src/server/db", () => ({
  getSql: () => ({
    query,
  }),
}));

import {
  listProductPage,
  updateReservation,
} from "../../src/server/products/repository";

describe("product repository contract", () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue([]);
  });

  it("casts the nullable reservation parameter before checking for null", async () => {
    await updateReservation("product-1", null);

    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain("set purchase_name = $1::text");
    expect(sql).toContain("when $1::text is null");
    expect(params).toEqual([null, "product-1"]);
  });

  it("loads one extra product with stable created_at/id ordering for page metadata", async () => {
    await listProductPage({ limit: 24 });

    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain("order by created_at desc, id desc");
    expect(sql).toContain("limit $1");
    expect(params).toEqual([25]);
  });

  it("uses a two-column cursor predicate for products with equal created_at values", async () => {
    await listProductPage({
      limit: 24,
      cursor: {
        createdAt: "2026-06-11T01:02:03.000Z",
        id: "product-10",
      },
    });

    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain(
      "(created_at < $1 or (created_at = $1 and id < $2))",
    );
    expect(sql).toContain("order by created_at desc, id desc");
    expect(sql).toContain("limit $3");
    expect(params).toEqual([
      "2026-06-11T01:02:03.000Z",
      "product-10",
      25,
    ]);
  });

  it("maps product filters to parameterized server-side SQL predicates", async () => {
    const [sellerName, purchaseName] = PERSON_NAMES;

    await listProductPage({
      limit: 12,
      filters: {
        freeOnly: true,
        unreservedOnly: true,
        sellerName,
        purchaseName,
      },
    });

    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain("price = 0");
    expect(sql).toContain("status = 'available'");
    expect(sql).toContain("seller_name = $1");
    expect(sql).toContain("purchase_name = $2");
    expect(sql).toContain("limit $3");
    expect(sql).not.toContain(`seller_name = '${sellerName}'`);
    expect(sql).not.toContain(`purchase_name = '${purchaseName}'`);
    expect(params).toEqual([sellerName, purchaseName, 13]);
  });
});
