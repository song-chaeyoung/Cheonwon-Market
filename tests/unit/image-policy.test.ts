import { describe, expect, it } from "vitest";

import {
  IMAGE_POLICY,
  IMAGE_POLICY_ERROR_MESSAGE,
  validateProductImages,
} from "../../src/server/images/policy";

const createFile = (name: string, type: string, size: number) =>
  new File([new Uint8Array(size)], name, { type });

describe("image policy", () => {
  it("requires at least one image", () => {
    const result = validateProductImages([]);

    expect(result).toEqual({
      ok: false,
      message: "이미지는 1장 이상 5장 이하로 올려주세요.",
    });
  });

  it("allows no more than five images", () => {
    const files = Array.from({ length: 6 }, (_, index) =>
      createFile(`${index}.png`, "image/png", 1024),
    );

    expect(validateProductImages(files)).toEqual({
      ok: false,
      message: IMAGE_POLICY_ERROR_MESSAGE,
    });
  });

  it("rejects unsupported MIME types", () => {
    const result = validateProductImages([
      createFile("avatar.gif", "image/gif", 1024),
    ]);

    expect(result).toEqual({
      ok: false,
      message: "지원하지 않는 이미지 형식이에요.",
    });
  });

  it("rejects images larger than five megabytes", () => {
    const result = validateProductImages([
      createFile("large.png", "image/png", IMAGE_POLICY.maxBytes + 1),
    ]);

    expect(result).toEqual({
      ok: false,
      message: "이미지는 장당 5MB 이하로 올려주세요.",
    });
  });

  it("accepts one to five jpeg, png, or webp images within size limits", () => {
    const result = validateProductImages([
      createFile("photo.jpeg", "image/jpeg", 1024),
      createFile("photo.png", "image/png", 1024),
      createFile("photo.webp", "image/webp", 1024),
    ]);

    expect(result).toEqual({ ok: true });
  });
});
