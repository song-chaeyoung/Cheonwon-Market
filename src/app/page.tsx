import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductList } from "@/components/products/product-list";
import { Button } from "@/components/ui/button";
import { MarketAccessError, requireMarketAccess } from "@/server/access";
import { listProductPage } from "@/server/products/repository";

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
  const productPage = await listProductPage({ limit: 24 });

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/cheonwon-mark.svg"
              alt=""
              width={48}
              height={36}
              unoptimized
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-normal">천원마켓</h1>
              <p className="text-sm font-medium text-muted-foreground">
                공짜부터 천원까지, 가볍게 예약
              </p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products/new">상품 올리기</Link>
          </Button>
        </header>
        <ProductList
          initialProducts={productPage.items}
          initialCursor={productPage.nextCursor}
        />
      </div>
    </main>
  );
}
