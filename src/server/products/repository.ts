import { getSql } from "../db";
import { productFromRow } from "./format";
import type {
  PersonName,
  ProductStatus,
} from "./constants";
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

export async function listProducts(): Promise<Product[]> {
  const result = await rows(
    `select ${PRODUCT_COLUMNS} from products order by created_at desc`,
  );

  return result.map(productFromRow);
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
  getProductById,
  getProductPasswordHash,
  createProduct,
  updateReservation,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};

export type ProductRepository = typeof productRepository;
