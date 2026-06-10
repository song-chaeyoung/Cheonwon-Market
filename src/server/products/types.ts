import type {
  PersonName,
  PriceOption,
  ProductCategory,
  ProductCondition,
  ProductStatus,
} from "./constants";

export type ProductRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  status: string;
  image_urls: string[];
  seller_name: string;
  purchase_name: string | null;
  flaw_note: string | null;
  edit_password_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
};

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: PriceOption;
  category: ProductCategory;
  condition: ProductCondition;
  status: ProductStatus;
  imageUrls: string[];
  sellerName: PersonName;
  purchaseName: PersonName | null;
  flawNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCreateInput = {
  title: string;
  description: string | null;
  price: PriceOption;
  category: ProductCategory;
  condition: ProductCondition;
  imageUrls: string[];
  sellerName: PersonName;
  flawNote: string | null;
  editPassword: string;
};

export type ProductUpdateInput = Omit<
  ProductCreateInput,
  "editPassword"
>;

export type ProductActionResult = {
  ok?: boolean;
  message: string;
};
