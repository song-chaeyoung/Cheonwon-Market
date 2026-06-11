import { describe, expect, it } from "vitest";

import {
  decodeProductCursor,
  encodeProductCursor,
} from "../../src/server/products/pagination";

describe("product cursor helpers", () => {
  it("round-trips createdAt and id as an opaque cursor string", () => {
    const cursor = {
      createdAt: "2026-06-11T01:02:03.000Z",
      id: "018f3f3c-8a68-7f62-9f3a-1a2b3c4d5e6f",
    };

    expect(decodeProductCursor(encodeProductCursor(cursor))).toEqual(cursor);
  });

  it("rejects malformed cursor strings", () => {
    expect(() => decodeProductCursor("not-json-or-base64")).toThrow(
      "Malformed product cursor",
    );
    expect(() =>
      decodeProductCursor(
        encodeProductCursor({
          createdAt: "not-a-date",
          id: "018f3f3c-8a68-7f62-9f3a-1a2b3c4d5e6f",
        }),
      ),
    ).toThrow("Malformed product cursor");
  });

  it("rejects cursor ids that are not UUIDs", () => {
    expect(() =>
      decodeProductCursor(
        encodeProductCursor({
          createdAt: "2026-06-11T01:02:03.000Z",
          id: "not-a-uuid",
        }),
      ),
    ).toThrow("Malformed product cursor");
  });
});
