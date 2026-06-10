import { PRODUCT_STATUS_LABELS } from "@/server/products/constants";
import { Badge } from "@/components/ui/badge";

import type { ProductStatus } from "./product-view-types";

const statusClassName: Record<ProductStatus, string> = {
  available: "border-[#b9e2d1] bg-[#e7f6ef] text-[#278866]",
  reserved: "border-[#f0dca2] bg-[#fdf6e0] text-[#8a6116]",
  completed: "border-[#e3dfd7] bg-[#f1efe9] text-[#76716a]",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="outline" className={statusClassName[status]}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}
