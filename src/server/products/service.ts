import { deleteProductImages } from "../images/blob";
import { hashPassword, verifyPassword } from "../password";
import {
  canTransitionStatus,
  type PersonName,
  type ProductStatus,
} from "./constants";
import {
  productRepository,
  type ProductRepository,
} from "./repository";
import {
  PRODUCT_ERROR_MESSAGES,
  isPersonName,
} from "./validation";
import type {
  Product,
  ProductActionResult,
  ProductCreateInput,
  ProductUpdateInput,
} from "./types";

type PasswordDeps = {
  hashPassword: typeof hashPassword;
  verifyPassword: typeof verifyPassword;
};

type ImageDeps = {
  deleteProductImages: typeof deleteProductImages;
};

type ProductServiceDeps = {
  repository?: Partial<ProductRepository>;
  password?: Partial<PasswordDeps>;
  images?: Partial<ImageDeps>;
};

const defaultPassword: PasswordDeps = {
  hashPassword,
  verifyPassword,
};

const defaultImages: ImageDeps = {
  deleteProductImages,
};

const ensureRepositoryMethod = <K extends keyof ProductRepository>(
  repository: Partial<ProductRepository>,
  key: K,
): ProductRepository[K] => {
  const method = repository[key];

  if (!method) {
    throw new Error(`Missing product repository method: ${key}`);
  }

  return method as ProductRepository[K];
};

export function createProductService(deps: ProductServiceDeps = {}) {
  const repository = { ...productRepository, ...deps.repository };
  const password = { ...defaultPassword, ...deps.password };
  const images = { ...defaultImages, ...deps.images };

  const verifyEditPassword = async (
    productId: string,
    editPassword: string,
  ): Promise<boolean> => {
    const getProductPasswordHash = ensureRepositoryMethod(
      repository,
      "getProductPasswordHash",
    );
    const passwordHash = await getProductPasswordHash(productId);

    return password.verifyPassword(editPassword, passwordHash);
  };

  return {
    async listProducts(): Promise<Product[]> {
      return ensureRepositoryMethod(repository, "listProducts")();
    },

    async getProductById(productId: string): Promise<Product | null> {
      return ensureRepositoryMethod(repository, "getProductById")(productId);
    },

    async createProduct(input: ProductCreateInput): Promise<ProductActionResult> {
      const createProduct = ensureRepositoryMethod(repository, "createProduct");
      const editPasswordHash = await password.hashPassword(input.editPassword);

      try {
        await createProduct({ ...input, editPasswordHash });
      } catch (error) {
        await images.deleteProductImages(input.imageUrls);
        throw error;
      }

      return { ok: true, message: PRODUCT_ERROR_MESSAGES.saved };
    },

    async changeReservation(
      productId: string,
      purchaseName: PersonName | null,
    ): Promise<ProductActionResult> {
      if (purchaseName !== null && !isPersonName(purchaseName)) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
      }

      const updateReservation = ensureRepositoryMethod(
        repository,
        "updateReservation",
      );
      const product = await updateReservation(productId, purchaseName);

      if (!product) {
        return {
          ok: false,
          message: PRODUCT_ERROR_MESSAGES.completedReservation,
        };
      }

      return {
        ok: true,
        message: PRODUCT_ERROR_MESSAGES.reservationChanged,
      };
    },

    async updateProduct(
      productId: string,
      input: Partial<ProductUpdateInput>,
      editPassword: string,
    ): Promise<ProductActionResult> {
      if (!(await verifyEditPassword(productId, editPassword))) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidPassword };
      }

      const updateProduct = ensureRepositoryMethod(repository, "updateProduct");
      await updateProduct(productId, input as ProductUpdateInput);
      return { ok: true, message: PRODUCT_ERROR_MESSAGES.saved };
    },

    async changeStatus(
      productId: string,
      status: ProductStatus,
      editPassword: string,
    ): Promise<ProductActionResult> {
      const getProductById = ensureRepositoryMethod(repository, "getProductById");
      const product = await getProductById(productId);

      if (!product) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
      }

      if (product.status === "completed") {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.completedStatus };
      }

      if (!canTransitionStatus(product.status, status)) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
      }

      if (status === "reserved" && product.purchaseName === null) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidInput };
      }

      if (!(await verifyEditPassword(productId, editPassword))) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidPassword };
      }

      const updateProductStatus = ensureRepositoryMethod(
        repository,
        "updateProductStatus",
      );
      await updateProductStatus(productId, status);
      return { ok: true, message: PRODUCT_ERROR_MESSAGES.saved };
    },

    async verifyEditPassword(
      productId: string,
      editPassword: string,
    ): Promise<ProductActionResult> {
      if (!(await verifyEditPassword(productId, editPassword))) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidPassword };
      }

      return { ok: true, message: PRODUCT_ERROR_MESSAGES.saved };
    },

    async deleteProduct(
      productId: string,
      editPassword: string,
    ): Promise<ProductActionResult> {
      if (!(await verifyEditPassword(productId, editPassword))) {
        return { ok: false, message: PRODUCT_ERROR_MESSAGES.invalidPassword };
      }

      const deleteProduct = ensureRepositoryMethod(repository, "deleteProduct");
      const deleted = await deleteProduct(productId);

      if (deleted) {
        await images.deleteProductImages(deleted.imageUrls);
      }

      return { ok: true, message: PRODUCT_ERROR_MESSAGES.deleted };
    },
  };
}

export const productService = createProductService();
