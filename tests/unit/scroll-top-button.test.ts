/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { ScrollTopButton } from "../../src/components/layout/scroll-top-button";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

describe("ScrollTopButton", () => {
  it("is mounted by the root layout", () => {
    const layoutSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf8",
    );

    expect(layoutSource).toContain(
      'import { ScrollTopButton } from "@/components/layout/scroll-top-button";',
    );
    expect(layoutSource).toContain("<ScrollTopButton />");
  });

  it("appears after scrolling and scrolls smoothly to the top", () => {
    const scrollTo = vi.fn();

    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    setScrollY(0);

    render(React.createElement(ScrollTopButton));

    expect(
      screen.queryByRole("button", { name: "맨 위로 이동" }),
    ).not.toBeInTheDocument();

    setScrollY(241);
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: "맨 위로 이동" });
    fireEvent.click(button);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });

    setScrollY(0);
    fireEvent.scroll(window);

    expect(
      screen.queryByRole("button", { name: "맨 위로 이동" }),
    ).not.toBeInTheDocument();
  });
});
