import { beforeEach, describe, expect, it, vi } from "vitest";

const { query } = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../../src/server/db", () => ({
  getSql: () => ({
    query,
  }),
}));

import { updateReservation } from "../../src/server/products/repository";

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
});
