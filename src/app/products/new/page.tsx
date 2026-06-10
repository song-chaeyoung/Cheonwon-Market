import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { MarketAccessError, requireMarketAccess } from "@/server/access";

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

export default async function NewProductPage() {
  await requirePageAccess();

  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b bg-background/80 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">천원마켓</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              상품 올리기
            </h1>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">목록으로</Link>
          </Button>
        </header>
        <section className="rounded-lg border bg-background p-4 sm:p-6">
          <ProductForm mode="create" />
        </section>
      </div>
    </main>
  );
}
