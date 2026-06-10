import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

import type { ProductForView } from "./product-view-types";
import { CONDITION_LABELS, PRICE_DISPLAY_LABELS } from "./product-view-types";
import { StatusBadge } from "./status-badge";

export function ProductCard({ product }: { product: ProductForView }) {
  return (
    <Card className="h-full gap-3 rounded-lg py-0">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.imageUrls[0]}
          alt={product.title}
          fill
          priority={false}
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform group-hover/card:scale-[1.02]"
        />
      </div>
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-base font-semibold">
              {product.title}
            </h2>
            <p className="text-sm font-medium">
              {PRICE_DISPLAY_LABELS[product.price]}
            </p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{CONDITION_LABELS[product.condition]}</span>
          <span>판매자 {product.sellerName}</span>
          {product.purchaseName ? (
            <span>예약 {product.purchaseName}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
