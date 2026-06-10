import { PRODUCT_STATUS_LABELS } from "@/server/products/constants";
import { Badge } from "@/components/ui/badge";

import type { ProductStatus } from "./product-view-types";

const statusClassName: Record<ProductStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  reserved: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="outline" className={statusClassName[status]}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}
