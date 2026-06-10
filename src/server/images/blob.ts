import { del, put } from "@vercel/blob";

import { getEnv } from "../env";

type DeleteAdapter = {
  del: (url: string) => Promise<void>;
};

type UploadAdapter = {
  put: typeof put;
};

const extensionFromFile = (file: File): string => {
  const [, extension] = file.name.match(/\.([a-z0-9]+)$/i) ?? [];

  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "png";
};

export async function uploadProductImage(
  file: File,
  adapter: UploadAdapter = { put },
): Promise<string> {
  const pathname = `products/${crypto.randomUUID()}.${extensionFromFile(file)}`;
  const blob = await adapter.put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
    token: getEnv().BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

export async function deleteProductImages(
  urls: string[],
  adapter: DeleteAdapter = { del },
): Promise<void> {
  for (const url of urls) {
    try {
      await adapter.del(url);
    } catch (error) {
      console.warn("Failed to delete product image blob", { url, error });
    }
  }
}
