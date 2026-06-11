import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ProductEmptyState } from "./product-empty-state";

export function EmptyProducts() {
  return (
    <ProductEmptyState
      title="아직 등록된 상품이 없어요."
      description="첫 번째 상품을 올려보세요."
      action={
        <Button asChild>
          <Link href="/products/new">상품 올리기</Link>
        </Button>
      }
    />
  );
}
