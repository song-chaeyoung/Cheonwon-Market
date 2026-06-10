import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PasswordConfirmDialog } from "./password-confirm-dialog";
import type { ProductForView } from "./product-view-types";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  PRICE_DISPLAY_LABELS,
} from "./product-view-types";
import { ReservationSelect } from "./reservation-select";
import { StatusBadge } from "./status-badge";

export function ProductDetailDialog({ product }: { product: ProductForView }) {
  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="min-w-0 space-y-2">
            <DialogTitle className="break-words text-xl leading-7">
              {product.title}
            </DialogTitle>
            <DialogDescription>
              {PRICE_DISPLAY_LABELS[product.price]} / 판매자{" "}
              {product.sellerName}
            </DialogDescription>
          </div>
          <StatusBadge status={product.status} />
        </div>
      </DialogHeader>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-3">
          <div className="grid gap-2">
            {product.imageUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={url}
                  alt={`${product.title} 이미지 ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">카테고리</dt>
              <dd className="mt-1 font-medium">
                {CATEGORY_LABELS[product.category]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">컨디션</dt>
              <dd className="mt-1 font-medium">
                {CONDITION_LABELS[product.condition]}
              </dd>
            </div>
          </dl>
          {product.description ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">설명</h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            </section>
          ) : null}
          {product.flawNote ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">하자 메모</h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {product.flawNote}
              </p>
            </section>
          ) : null}
          <ReservationSelect product={product} />
        </div>
      </div>
      <DialogFooter>
        <PasswordConfirmDialog
          productId={product.id}
          trigger={
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              수정하기
            </Button>
          }
        />
      </DialogFooter>
    </DialogContent>
  );
}
