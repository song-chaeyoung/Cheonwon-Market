"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useInfiniteScroll } from "./use-infinite-scroll";

type CursorPage<Item, Cursor> = {
  items: Item[];
  nextCursor: Cursor | null;
};

type UseCursorInfiniteOptions<Item, Cursor> = {
  initialItems: Item[];
  initialCursor: Cursor | null;
  getNextPage: (
    cursor: Cursor | null,
    signal: AbortSignal,
  ) => Promise<CursorPage<Item, Cursor>>;
  resetKey: string;
  autoLoadFirstPage?: boolean;
  rootMargin?: string;
};

export function useCursorInfinite<Item, Cursor>({
  initialItems,
  initialCursor,
  getNextPage,
  resetKey,
  autoLoadFirstPage = false,
  rootMargin,
}: UseCursorInfiniteOptions<Item, Cursor>) {
  const optionsRef = useRef({
    initialItems,
    initialCursor,
    getNextPage,
    autoLoadFirstPage,
  });

  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNextPage, setHasNextPage] = useState(
    initialCursor !== null || autoLoadFirstPage,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    optionsRef.current = {
      initialItems,
      initialCursor,
      getNextPage,
      autoLoadFirstPage,
    };
  }, [autoLoadFirstPage, getNextPage, initialCursor, initialItems]);

  const loadPage = useCallback(
    async (cursorToLoad: Cursor | null, replace: boolean) => {
      if (abortControllerRef.current) {
        return;
      }

      const controller = new AbortController();
      const requestId = requestIdRef.current + 1;
      abortControllerRef.current = controller;
      requestIdRef.current = requestId;
      setIsLoading(true);
      setError(null);

      try {
        const page = await optionsRef.current.getNextPage(
          cursorToLoad,
          controller.signal,
        );

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setItems((currentItems) =>
          replace ? page.items : [...currentItems, ...page.items],
        );
        setCursor(page.nextCursor);
        setHasNextPage(page.nextCursor !== null);
      } catch (caughtError) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to load page"),
        );
      } finally {
        if (requestId === requestIdRef.current) {
          abortControllerRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current += 1;
    setItems(optionsRef.current.initialItems);
    setCursor(optionsRef.current.initialCursor);
    setHasNextPage(
      optionsRef.current.initialCursor !== null ||
        optionsRef.current.autoLoadFirstPage,
    );
    setIsLoading(false);
    setError(null);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || abortControllerRef.current) {
      return;
    }

    await loadPage(cursor, false);
  }, [cursor, hasNextPage, loadPage]);

  useEffect(() => {
    reset();

    if (optionsRef.current.autoLoadFirstPage) {
      void loadPage(null, true);
    }
  }, [loadPage, reset, resetKey]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, []);

  const targetRef = useInfiniteScroll({
    enabled: hasNextPage && !error,
    isLoading,
    onLoadMore: () => {
      void loadMore();
    },
    rootMargin,
  });

  return {
    items,
    targetRef,
    sentinelRef: targetRef,
    isLoading,
    hasNextPage,
    error,
    loadMore,
    reset,
  };
}
