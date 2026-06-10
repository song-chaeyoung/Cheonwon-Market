import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getEnv } from "./env";

export const MARKET_ACCESS_COOKIE = "cheonwon_market_access";
export const ACCESS_DENIED_MESSAGE = "입장 코드가 맞지 않아요.";

export class MarketAccessError extends Error {
  constructor() {
    super(ACCESS_DENIED_MESSAGE);
    this.name = "MarketAccessError";
  }
}

type CookieRuntimeEnv = "development" | "production" | "test" | string;

export function getMarketAccessCookieOptions(
  env: CookieRuntimeEnv = process.env.NODE_ENV ?? "development",
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env === "production",
    path: "/",
  };
}

const sign = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};

export async function createMarketAccessCookieValue({
  entryCode,
  secret,
}: {
  entryCode: string;
  secret: string;
}): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      issuedAt: Date.now(),
      codeHash: sign(entryCode, secret),
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

export async function verifyMarketAccessCookieValue(
  value: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!value) {
    return false;
  }

  const [payload, signature, extra] = value.split(".");

  if (!payload || !signature || extra !== undefined) {
    return false;
  }

  return safeEqual(sign(payload, secret), signature);
}

export async function hasMarketAccess(): Promise<boolean> {
  const env = getEnv();
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(MARKET_ACCESS_COOKIE)?.value;

  return verifyMarketAccessCookieValue(
    cookieValue,
    env.MARKET_ACCESS_COOKIE_SECRET,
  );
}

export async function requireMarketAccess(): Promise<void> {
  if (!(await hasMarketAccess())) {
    throw new MarketAccessError();
  }
}

export async function grantMarketAccess(entryCode: string): Promise<boolean> {
  const env = getEnv();

  if (entryCode !== env.MARKET_ENTRY_CODE) {
    return false;
  }

  const cookieStore = await cookies();
  const value = await createMarketAccessCookieValue({
    entryCode,
    secret: env.MARKET_ACCESS_COOKIE_SECRET,
  });

  cookieStore.set(
    MARKET_ACCESS_COOKIE,
    value,
    getMarketAccessCookieOptions(process.env.NODE_ENV),
  );

  return true;
}
