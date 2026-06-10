import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductList } from "@/components/products/product-list";
import { Button } from "@/components/ui/button";
import { MarketAccessError, requireMarketAccess } from "@/server/access";
import { listProducts } from "@/server/products/repository";

export const dynamic = "force-dynamic";

async function requirePageAccess() {
  try {
    await requireMarketAccess();
  } catch (error) {
    if (error instanceof MarketAccessError) {
      redirect("/enter");
    }

    throw error;
  }
}

export default async function Home() {
  await requirePageAccess();
  const products = await listProducts();

  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b bg-background/80 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              친구 모임 중고 예약장
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              천원마켓
            </h1>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products/new">상품 올리기</Link>
          </Button>
        </header>
        <ProductList products={products} />
      </div>
    </main>
  );
}
