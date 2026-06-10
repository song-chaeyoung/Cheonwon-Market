create extension if not exists pgcrypto;

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price integer not null,
  category text not null default 'etc',
  condition text not null default 'used',
  status text not null default 'available',
  image_urls text[] not null,
  seller_name text not null,
  purchase_name text default null,
  flaw_note text,
  edit_password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_price_check check (price in (0, 500, 1000)),
  constraint products_status_check check (status in ('available', 'reserved', 'completed')),
  constraint products_category_check check (category in ('clothes', 'electronics', 'books', 'living', 'hobby', 'etc')),
  constraint products_condition_check check (condition in ('like_new', 'good', 'used', 'flawed')),
  constraint products_seller_name_check check (seller_name in ('채영', '유나', '비주')),
  constraint products_purchase_name_check check (purchase_name is null or purchase_name in ('채영', '유나', '비주')),
  constraint products_purchase_status_check check (
    (status = 'available' and purchase_name is null)
    or (status = 'reserved' and purchase_name is not null)
    or status = 'completed'
  ),
  constraint products_image_urls_check check (cardinality(image_urls) between 1 and 5)
);

create index products_created_at_idx on products (created_at desc);
create index products_price_idx on products (price);
create index products_status_idx on products (status);

create function set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at_trigger
before update on products
for each row
execute function set_products_updated_at();
