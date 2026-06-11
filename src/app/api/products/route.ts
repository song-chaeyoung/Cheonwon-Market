import { NextResponse } from "next/server";

import { MarketAccessError, requireMarketAccess } from "@/server/access";
import { PERSON_NAMES, type PersonName } from "@/server/products/constants";
import {
  decodeProductCursor,
  type ProductCursor,
} from "@/server/products/pagination";
import {
  listProductPage,
  type ProductPageFilters,
} from "@/server/products/repository";

const DEFAULT_PRODUCT_PAGE_LIMIT = 24;
const MAX_PRODUCT_PAGE_LIMIT = 60;

type ParsedProductPageQuery = {
  limit: number;
  cursor: ProductCursor | null;
  filters: ProductPageFilters;
};

function parseBooleanFilter(value: string | null, name: string) {
  if (value === null) {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Invalid ${name}`);
}

function parsePersonFilter(value: string | null, name: string) {
  if (value === null || value === "all") {
    return "all";
  }

  if ((PERSON_NAMES as readonly string[]).includes(value)) {
    return value as PersonName;
  }

  throw new Error(`Invalid ${name}`);
}

function parseLimit(value: string | null) {
  if (value === null) {
    return DEFAULT_PRODUCT_PAGE_LIMIT;
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_PRODUCT_PAGE_LIMIT
  ) {
    throw new Error("Invalid limit");
  }

  return limit;
}

function parseProductPageQuery(url: string): ParsedProductPageQuery {
  const params = new URL(url).searchParams;
  const cursorValue = params.get("cursor");

  return {
    limit: parseLimit(params.get("limit")),
    cursor: cursorValue ? decodeProductCursor(cursorValue) : null,
    filters: {
      freeOnly: parseBooleanFilter(params.get("freeOnly"), "freeOnly"),
      unreservedOnly: parseBooleanFilter(
        params.get("unreservedOnly"),
        "unreservedOnly",
      ),
      sellerName: parsePersonFilter(params.get("sellerName"), "sellerName"),
      purchaseName: parsePersonFilter(
        params.get("purchaseName"),
        "purchaseName",
      ),
    },
  };
}

export async function GET(request: Request) {
  try {
    await requireMarketAccess();
  } catch (error) {
    if (error instanceof MarketAccessError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    throw error;
  }

  let query: ParsedProductPageQuery;

  try {
    query = parseProductPageQuery(request.url);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    throw error;
  }

  const page = await listProductPage(query);

  return NextResponse.json(page);
}
