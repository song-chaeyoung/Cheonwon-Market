/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCursorInfinite } from "../../src/hooks/use-cursor-infinite";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });

  return { promise, resolve };
}

describe("useCursorInfinite", () => {
  it("prevents duplicate page requests while a request is already loading", async () => {
    const page = deferred<{ items: string[]; nextCursor: string | null }>();
    const getNextPage = vi.fn<
      (
        cursor: string | null,
        signal: AbortSignal,
      ) => Promise<{ items: string[]; nextCursor: string | null }>
    >(() => page.promise);
    const { result } = renderHook(() =>
      useCursorInfinite({
        initialItems: ["first"],
        initialCursor: "cursor-1",
        getNextPage,
        resetKey: "default",
      }),
    );

    act(() => {
      void result.current.loadMore();
      void result.current.loadMore();
    });

    expect(getNextPage).toHaveBeenCalledTimes(1);
    expect(getNextPage.mock.calls[0][0]).toBe("cursor-1");

    await act(async () => {
      page.resolve({ items: ["second"], nextCursor: null });
      await page.promise;
    });

    expect(result.current.items).toEqual(["first", "second"]);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("aborts stale requests and resets items when the reset key changes", async () => {
    const page = deferred<{ items: string[]; nextCursor: string | null }>();
    const signals: AbortSignal[] = [];
    const getNextPage = vi.fn((_cursor: string | null, signal: AbortSignal) => {
      signals.push(signal);
      return page.promise;
    });
    const { rerender, result } = renderHook(
      ({ resetKey }) =>
        useCursorInfinite({
          initialItems: ["first"],
          initialCursor: "cursor-1",
          getNextPage,
          resetKey,
        }),
      {
        initialProps: { resetKey: "default" },
      },
    );

    act(() => {
      void result.current.loadMore();
    });

    rerender({ resetKey: "filtered" });

    expect(signals[0].aborted).toBe(true);
    expect(result.current.items).toEqual(["first"]);

    await act(async () => {
      page.resolve({ items: ["stale"], nextCursor: null });
      await page.promise;
    });

    await waitFor(() => {
      expect(result.current.items).toEqual(["first"]);
    });
  });
});
