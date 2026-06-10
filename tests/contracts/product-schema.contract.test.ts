import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve("db/migrations/0001_create_products.sql");

const normalizeSql = (sql: string) => sql.replace(/\s+/g, " ").toLowerCase();

describe("products schema contract", () => {
  it("creates the products table with MVP columns, constraints, and indexes", () => {
    const sql = normalizeSql(readFileSync(migrationPath, "utf8"));

    expect(sql).toContain("create table products");
    expect(sql).toContain("id uuid primary key default gen_random_uuid()");
    expect(sql).toContain("price integer not null");
    expect(sql).toContain("category text not null default 'etc'");
    expect(sql).toContain("condition text not null default 'used'");
    expect(sql).toContain("status text not null default 'available'");
    expect(sql).toContain("image_urls text[] not null");
    expect(sql).toContain("seller_name text not null");
    expect(sql).toContain("purchase_name text default null");
    expect(sql).toContain("edit_password_hash text not null");

    expect(sql).toContain(
      "constraint products_price_check check (price in (0, 500, 1000))",
    );
    expect(sql).toContain(
      "constraint products_status_check check (status in ('available', 'reserved', 'completed'))",
    );
    expect(sql).toContain(
      "constraint products_category_check check (category in ('clothes', 'electronics', 'books', 'living', 'hobby', 'etc'))",
    );
    expect(sql).toContain(
      "constraint products_condition_check check (condition in ('like_new', 'good', 'used', 'flawed'))",
    );
    expect(sql).toContain(
      "constraint products_seller_name_check check (seller_name in ('채영', '유나', '비주'))",
    );
    expect(sql).toContain(
      "constraint products_purchase_name_check check (purchase_name is null or purchase_name in ('채영', '유나', '비주'))",
    );
    expect(sql).toContain("status = 'available' and purchase_name is null");
    expect(sql).toContain("status = 'reserved' and purchase_name is not null");
    expect(sql).toContain("or status = 'completed'");
    expect(sql).toContain(
      "constraint products_image_urls_check check (cardinality(image_urls) between 1 and 5)",
    );

    expect(sql).toContain(
      "create index products_created_at_idx on products (created_at desc)",
    );
    expect(sql).toContain("create index products_price_idx on products (price)");
    expect(sql).toContain("create index products_status_idx on products (status)");
  });
});
