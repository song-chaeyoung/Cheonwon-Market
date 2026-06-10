import { describe, expect, it } from "vitest";

import {
  ACCESS_DENIED_MESSAGE,
  MARKET_ACCESS_COOKIE,
  createMarketAccessCookieValue,
  getMarketAccessCookieOptions,
  verifyMarketAccessCookieValue,
} from "../../src/server/access";

describe("access code contract", () => {
  it("uses the Korean failure message from the MVP spec", () => {
    expect(ACCESS_DENIED_MESSAGE).toBe("입장 코드가 맞지 않아요.");
  });

  it("sets an httpOnly lax site-wide cookie", () => {
    expect(MARKET_ACCESS_COOKIE).toBe("cheonwon_market_access");
    expect(getMarketAccessCookieOptions("development")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    expect(getMarketAccessCookieOptions("production")).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  });

  it("signs the access cookie value without storing the raw entry code", async () => {
    const value = await createMarketAccessCookieValue({
      entryCode: "open-sesame",
      secret: "test-secret",
    });

    expect(value).not.toContain("open-sesame");
    expect(await verifyMarketAccessCookieValue(value, "test-secret")).toBe(true);
    expect(await verifyMarketAccessCookieValue(value, "wrong-secret")).toBe(
      false,
    );
  });
});
