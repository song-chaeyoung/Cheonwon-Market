"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { changeReservationAction } from "@/app/products/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERSON_NAMES } from "@/server/products/constants";

import type { PersonName, ProductForView } from "./product-view-types";
import { NONE_PURCHASER_VALUE } from "./product-view-types";

export function ReservationSelect({ product }: { product: ProductForView }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const disabled = product.status === "completed" || pending;

  const value = product.purchaseName ?? NONE_PURCHASER_VALUE;

  function handleValueChange(nextValue: string) {
    const purchaseName =
      nextValue === NONE_PURCHASER_VALUE ? null : (nextValue as PersonName);

    setPending(true);
    setMessage(null);
    startTransition(async () => {
      const result = await changeReservationAction(product.id, purchaseName);
      setMessage(result?.message ?? null);
      setPending(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          className="text-sm font-medium"
          htmlFor={`reservation-${product.id}`}
        >
          예약자
        </label>
        {product.status === "completed" ? (
          <span className="text-xs text-muted-foreground">
            거래가 완료된 상품이에요.
          </span>
        ) : null}
      </div>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger id={`reservation-${product.id}`} className="w-full">
          <SelectValue placeholder="예약자를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_PURCHASER_VALUE}>없음</SelectItem>
          {PERSON_NAMES.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
