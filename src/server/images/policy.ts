export const IMAGE_POLICY = {
  minFiles: 1,
  maxFiles: 5,
  maxBytes: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const IMAGE_POLICY_ERROR_MESSAGE =
  "이미지는 1장 이상 5장 이하로 올려주세요.";

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateProductImages(
  files: Array<Pick<File, "size" | "type">>,
): ImageValidationResult {
  if (
    files.length < IMAGE_POLICY.minFiles ||
    files.length > IMAGE_POLICY.maxFiles
  ) {
    return { ok: false, message: IMAGE_POLICY_ERROR_MESSAGE };
  }

  if (
    !files.every((file) =>
      (IMAGE_POLICY.allowedTypes as readonly string[]).includes(file.type),
    )
  ) {
    return { ok: false, message: "지원하지 않는 이미지 형식이에요." };
  }

  if (files.some((file) => file.size > IMAGE_POLICY.maxBytes)) {
    return { ok: false, message: "이미지는 장당 5MB 이하로 올려주세요." };
  }

  return { ok: true };
}
