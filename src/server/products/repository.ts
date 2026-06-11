import { getSql } from "../db";
import { productFromRow } from "./format";
import type {
  PersonName,
  ProductStatus,
} from "./constants";
import {
  encodeProductCursor,
  type ProductCursor,
} from "./pagination";
import type {
  Product,
  ProductCreateInput,
  ProductRow,
  ProductUpdateInput,
} from "./types";

const PRODUCT_COLUMNS = `
  id,
  title,
  description,
  price,
  category,
  condition,
  status,
  image_urls,
  seller_name,
  purchase_name,
  flaw_note,
  edit_password_hash,
  created_at,
  updated_at
`;

const rows = async (query: string, params: unknown[] = []): Promise<ProductRow[]> =>
  (await getSql().query(query, params)) as ProductRow[];

export type ProductPageFilters = {
  freeOnly?: boolean;
  unreservedOnly?: boolean;
  sellerName?: PersonName | "all";
  purchaseName?: PersonName | "all";
};

export type ProductPageInput = {
  limit: number;
  cursor?: ProductCursor | null;
  filters?: ProductPageFilters;
};

export type ProductPage = {
  items: Product[];
  nextCursor: string | null;
};

export async function listProducts(): Promise<Product[]> {
  const result = await rows(
    `select ${PRODUCT_COLUMNS} from products order by created_at desc`,
  );

  return result.map(productFromRow);
}

export async function listProductPage({
  limit,
  cursor = null,
  filters = {},
}: ProductPageInput): Promise<ProductPage> {
  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (cursor) {
    params.push(cursor.createdAt, cursor.id);
    whereClauses.push(
      `(created_at < $${params.length - 1} or (created_at = $${params.length - 1} and id < $${params.length}))`,
    );
  }

  if (filters.freeOnly) {
    whereClauses.push("price = 0");
  }

  if (filters.unreservedOnly) {
    whereClauses.push("status = 'available'");
  }

  if (filters.sellerName && filters.sellerName !== "all") {
    params.push(filters.sellerName);
    whereClauses.push(`seller_name = $${params.length}`);
  }

  if (filters.purchaseName && filters.purchaseName !== "all") {
    params.push(filters.purchaseName);
    whereClauses.push(`purchase_name = $${params.length}`);
  }

  params.push(limit + 1);

  const result = (await rows(
    `select ${PRODUCT_COLUMNS}, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as cursor_created_at from products${
      whereClauses.length > 0 ? ` where ${whereClauses.join(" and ")}` : ""
    } order by created_at desc, id desc limit $${params.length}`,
    params,
  )) as (ProductRow & { cursor_created_at: string })[];
  const pageRows = result.slice(0, limit);
  const items = pageRows.map(productFromRow);
  const lastRow = pageRows.at(-1);
  const nextCursor =
    result.length > limit && lastRow
      ? encodeProductCursor({
          createdAt: lastRow.cursor_created_at,
          id: lastRow.id,
        })
      : null;

  return { items, nextCursor };
}

export async function getProductById(id: string): Promise<Product | null> {
  const [row] = await rows(
    `select ${PRODUCT_COLUMNS} from products where id = $1`,
    [id],
  );

  return row ? productFromRow(row) : null;
}

export async function getProductPasswordHash(
  id: string,
): Promise<string | null> {
  const [row] = (await getSql().query(
    "select edit_password_hash from products where id = $1",
    [id],
  )) as Array<{ edit_password_hash: string }>;

  return row?.edit_password_hash ?? null;
}

export async function createProduct(
  input: ProductCreateInput & { editPasswordHash: string },
): Promise<Product> {
  const [row] = await rows(
    `insert into products (
      title,
      description,
      price,
      category,
      condition,
      image_urls,
      seller_name,
      flaw_note,
      edit_password_hash
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning ${PRODUCT_COLUMNS}`,
    [
      input.title,
      input.description,
      input.price,
      input.category,
      input.condition,
      input.imageUrls,
      input.sellerName,
      input.flawNote,
      input.editPasswordHash,
    ],
  );

  return productFromRow(row);
}

export async function updateReservation(
  id: string,
  purchaseName: PersonName | null,
): Promise<Product | null> {
  const [row] = await rows(
    `update products
set purchase_name = $1::text,
    status = case
      when $1::text is null then 'available'
      else 'reserved'
    end,
    updated_at = now()
where id = $2
  and status <> 'completed'
returning ${PRODUCT_COLUMNS}`,
    [purchaseName, id],
  );

  return row ? productFromRow(row) : null;
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
): Promise<Product | null> {
  const [row] = await rows(
    `update products
    set title = $1,
        description = $2,
        price = $3,
        category = $4,
        condition = $5,
        image_urls = $6,
        seller_name = $7,
        flaw_note = $8,
        updated_at = now()
    where id = $9
    returning ${PRODUCT_COLUMNS}`,
    [
      input.title,
      input.description,
      input.price,
      input.category,
      input.condition,
      input.imageUrls,
      input.sellerName,
      input.flawNote,
      id,
    ],
  );

  return row ? productFromRow(row) : null;
}

export async function updateProductStatus(
  id: string,
  status: ProductStatus,
): Promise<Product | null> {
  const [row] = await rows(
    `update products
    set status = $1,
        purchase_name = case
          when $1 = 'available' then null
          else purchase_name
        end,
        updated_at = now()
    where id = $2
      and status <> 'completed'
    returning ${PRODUCT_COLUMNS}`,
    [status, id],
  );

  return row ? productFromRow(row) : null;
}

export async function deleteProduct(id: string): Promise<Product | null> {
  const [row] = await rows(
    `delete from products where id = $1 returning ${PRODUCT_COLUMNS}`,
    [id],
  );

  return row ? productFromRow(row) : null;
}

export const productRepository = {
  listProducts,
  listProductPage,
  getProductById,
  getProductPasswordHash,
  createProduct,
  updateReservation,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};

export type ProductRepository = typeof productRepository;
