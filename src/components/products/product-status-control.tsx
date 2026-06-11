"use client";

import { useActionState } from "react";

import { changeStatusAction } from "@/app/products/actions";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_STATUS_LABELS } from "@/server/products/constants";

import type {
  ActionResult,
  ProductForView,
  ProductStatus,
} from "./product-view-types";

type StatusAction = (
  previousState: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

const initialState: ActionResult = {
  ok: false,
  message: "",
};

export function ProductStatusControl({ product }: { product: ProductForView }) {
  const [state, formAction, pending] = useActionState(
    changeStatusAction as StatusAction,
    initialState,
  );
  const isCompleted = product.status === "completed";
  const statusOptions = isCompleted
    ? (["completed"] as const satisfies readonly ProductStatus[])
    : ([product.status, "completed"] as const satisfies readonly ProductStatus[]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border bg-background p-4"
    >
      <input type="hidden" name="id" value={product.id} />
      <div className="space-y-1">
        <h2 className="text-base font-semibold">판매 상태</h2>
        <p className="text-sm text-muted-foreground">
          거래 완료로 바꾸면 1차 MVP에서는 되돌릴 수 없어요.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            name="status"
            defaultValue={product.status}
            disabled={isCompleted}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="상태를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {PRODUCT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statusEditPassword">수정 비밀번호</Label>
          <Input
            id="statusEditPassword"
            name="editPassword"
            type="password"
            autoComplete="current-password"
            required
            disabled={isCompleted}
          />
        </div>
      </div>
      {state.message ? (
        <ActionMessage tone={state.ok ? "success" : "error"}>
          {state.message}
        </ActionMessage>
      ) : null}
      <Button
        type="submit"
        disabled={pending || isCompleted}
        className="w-full sm:w-auto"
      >
        {pending ? "변경 중" : "상태 변경"}
      </Button>
    </form>
  );
}
