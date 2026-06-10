import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyProducts() {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed bg-background px-4 py-12 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold">아직 등록된 상품이 없어요.</p>
        <p className="text-sm text-muted-foreground">
          첫 번째 상품을 올려보세요.
        </p>
      </div>
      <Button asChild>
        <Link href="/products/new">상품 올리기</Link>
      </Button>
    </section>
  );
}
