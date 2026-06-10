"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMarketAccess } from "@/server/access";
import {
  type ProductStatus,
} from "@/server/products/constants";
import { productService } from "@/server/products/service";
import type { ProductActionResult } from "@/server/products/types";
import {
  PRODUCT_ERROR_MESSAGES,
  isProductStatus,
  parseCreateProductFormData,
  parsePurchaseName,
  parseUpdateProductFormData,
} from "@/server/products/validation";

const productIdFromFormData = (formData: FormData): string | null => {
  const productId = formData.get("productId") ?? formData.get("id");
  return typeof productId === "string" && productId.trim() !== ""
    ? productId.trim()
    : null;
};

const editPasswordFromFormData = (formData: FormData): string | null => {
  const editPassword = formData.get("editPassword");
  return typeof editPassword === "string" && editPassword.trim() !== ""
    ? editPassword
    : null;
};

export async function createProductAction(
  _prevState: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  const parsed = parseCreateProductFormData(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  const result = await productService.createProduct(parsed.value);

  if (!result.ok) {
    return result;
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateProductAction(
  _prevState: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  const productId = productIdFromFormData(formData);
  const parsed = parseUpdateProductFormData(formData);
  const editPassword = editPasswordFromFormData(formData);

  if (!productId || !parsed.ok || !editPassword) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  const result = await productService.updateProduct(
    productId,
    parsed.value,
    editPassword,
  );

  if (!result.ok) {
    return result;
  }

  revalidatePath("/");
  redirect("/");
}

export async function changeReservationAction(
  productId: string,
  purchaseNameValue: string | null,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  const purchaseName = parsePurchaseName(purchaseNameValue);

  if (
    purchaseNameValue !== null &&
    purchaseNameValue !== "" &&
    purchaseNameValue !== "none" &&
    purchaseName === null
  ) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  const result = await productService.changeReservation(productId, purchaseName);

  revalidatePath("/");
  return result;
}

export async function verifyEditPasswordAction(
  productId: string,
  editPassword: string,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  return productService.verifyEditPassword(productId, editPassword);
}

export async function changeStatusAction(
  _prevState: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  const productId = productIdFromFormData(formData);
  const status = formData.get("status");
  const editPassword = editPasswordFromFormData(formData);

  if (!productId || !editPassword || !isProductStatus(status)) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  const result = await productService.changeStatus(
    productId,
    status,
    editPassword,
  );

  revalidatePath("/");
  return result;
}

export async function changeProductStatusAction(
  productId: string,
  status: ProductStatus,
  editPassword: string,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  if (!isProductStatus(status)) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  const result = await productService.changeStatus(
    productId,
    status,
    editPassword,
  );

  revalidatePath("/");
  return result;
}

export async function deleteProductAction(
  _prevState: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireMarketAccess();

  const productId = productIdFromFormData(formData);
  const editPassword = editPasswordFromFormData(formData);

  if (!productId || !editPassword) {
    return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
  }

  const result = await productService.deleteProduct(productId, editPassword);

  if (!result.ok) {
    return result;
  }

  revalidatePath("/");
  redirect("/");
}
