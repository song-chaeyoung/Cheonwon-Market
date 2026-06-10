import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { ProductForm } from "@/components/products/product-form";
import { ProductStatusControl } from "@/components/products/product-status-control";
import { Button } from "@/components/ui/button";
import { MarketAccessError, requireMarketAccess } from "@/server/access";
import { getProductById } from "@/server/products/repository";

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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requirePageAccess();
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b bg-background/80 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">천원마켓</p>
            <h1 className="break-words text-2xl font-semibold tracking-normal">
              상품 수정
            </h1>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">목록으로</Link>
          </Button>
        </header>
        <section className="rounded-lg border bg-background p-4 sm:p-6">
          <ProductForm mode="edit" product={product} />
        </section>
        <ProductStatusControl product={product} />
        <section className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">삭제</h2>
            <p className="text-sm text-muted-foreground">
              삭제할 때도 수정 비밀번호를 다시 확인합니다.
            </p>
          </div>
          <DeleteProductDialog productId={product.id} />
        </section>
      </div>
    </main>
  );
}
