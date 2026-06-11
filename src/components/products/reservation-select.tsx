"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { changeReservationAction } from "@/app/products/actions";
import { ActionMessage } from "@/components/ui/action-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { withSubjectJosa } from "@/lib/korean-text";
import { PERSON_NAMES } from "@/server/products/constants";

import type {
  ActionResult,
  PersonName,
  ProductForView,
} from "./product-view-types";
import { NONE_PURCHASER_VALUE } from "./product-view-types";

const inlineTriggerClassName =
  "inline-flex h-auto gap-0.5 rounded-sm border-0 p-0 align-baseline font-semibold text-primary underline decoration-primary/40 underline-offset-4 data-[size=default]:h-auto [&_svg]:text-primary!";

export function ReservationSelect({ product }: { product: ProductForView }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const disabled = product.status === "completed" || pending;

  const value = product.purchaseName ?? NONE_PURCHASER_VALUE;

  function handleValueChange(nextValue: string) {
    const purchaseName =
      nextValue === NONE_PURCHASER_VALUE ? null : (nextValue as PersonName);

    setPending(true);
    setResult(null);
    startTransition(async () => {
      const nextResult = await changeReservationAction(product.id, purchaseName);
      setResult(nextResult ?? null);
      setPending(false);
      router.refresh();
    });
  }

  if (product.status === "completed") {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        거래가 완료된 물건이에요.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm leading-6">
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          {product.purchaseName ? (
            <>
              이 물건,{" "}
              <SelectTrigger
                id={`reservation-${product.id}`}
                aria-label="예약자 변경"
                className={inlineTriggerClassName}
              >
                {withSubjectJosa(product.purchaseName)}
              </SelectTrigger>{" "}
              예약했어요
            </>
          ) : (
            <>
              아직 예약한 사람이 없어요.{" "}
              <SelectTrigger
                id={`reservation-${product.id}`}
                aria-label="예약자 선택"
                className={inlineTriggerClassName}
              >
                예약하기
              </SelectTrigger>
            </>
          )}
          <SelectContent position="popper" align="start">
            <SelectItem value={NONE_PURCHASER_VALUE}>없음</SelectItem>
            {PERSON_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </p>
      {result?.message ? (
        <ActionMessage tone={result.ok ? "success" : "error"}>
          {result.message}
        </ActionMessage>
      ) : null}
    </div>
  );
}
