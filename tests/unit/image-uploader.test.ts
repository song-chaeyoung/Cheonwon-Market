/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { ImageUploader } from "../../src/components/products/image-uploader";

describe("ImageUploader", () => {
  it("uses a button-styled label to trigger the file input", () => {
    render(React.createElement(ImageUploader));

    const fileInput = screen.getByLabelText("이미지 선택");
    const trigger = screen.getByText("이미지 선택");

    expect(fileInput).toHaveAttribute("id", "product-images");
    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveClass("sr-only");
    expect(trigger.tagName).toBe("LABEL");
    expect(trigger).toHaveAttribute("for", "product-images");
    expect(trigger).toHaveClass("inline-flex");
  });
});
