export type ProductCursor = {
  createdAt: string;
  id: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isProductCursor(value: unknown): value is ProductCursor {
  if (!value || typeof value !== "object") {
    return false;
  }

  const cursor = value as Partial<ProductCursor>;

  return (
    typeof cursor.createdAt === "string" &&
    !Number.isNaN(Date.parse(cursor.createdAt)) &&
    typeof cursor.id === "string" &&
    UUID_PATTERN.test(cursor.id)
  );
}

export function encodeProductCursor(cursor: ProductCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeProductCursor(value: string): ProductCursor {
  try {
    const decoded = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as unknown;

    if (isProductCursor(decoded)) {
      return decoded;
    }
  } catch {
    // Fall through to a consistent public error.
  }

  throw new Error("Malformed product cursor");
}
