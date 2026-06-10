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
        <div className="absolute left-2 top-2">
          <StatusBadge status={product.status} />
        </div>
      </div>
      <CardContent className="space-y-2 pb-4">
        <div className="min-w-0 space-y-1">
          <p className="text-lg font-bold leading-tight">
            {PRICE_DISPLAY_LABELS[product.price]}
          </p>
          <h2 className="truncate text-sm font-medium">{product.title}</h2>
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
