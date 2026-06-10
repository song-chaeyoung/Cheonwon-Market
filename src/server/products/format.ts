import type { Product, ProductRow } from "./types";

const toIsoString = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : value;

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price as Product["price"],
    category: row.category as Product["category"],
    condition: row.condition as Product["condition"],
    status: row.status as Product["status"],
    imageUrls: row.image_urls,
    sellerName: row.seller_name as Product["sellerName"],
    purchaseName: row.purchase_name as Product["purchaseName"],
    flawNote: row.flaw_note,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
