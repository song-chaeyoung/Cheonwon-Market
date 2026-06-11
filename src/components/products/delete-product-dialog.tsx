"use client";

import { useActionState } from "react";

import { deleteProductAction } from "@/app/products/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ActionResult } from "./product-view-types";

type DeleteAction = (
  previousState: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

const initialState: ActionResult = {
  ok: false,
  message: "",
};

export function DeleteProductDialog({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction as DeleteAction,
    initialState,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="w-full sm:w-auto">
          상품 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>상품을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            삭제하면 목록에서 사라지고 되돌릴 수 없어요. 수정 비밀번호를
            입력해야 삭제할 수 있어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={productId} />
          <div className="space-y-2">
            <Label htmlFor="deleteEditPassword">수정 비밀번호</Label>
            <Input
              id="deleteEditPassword"
              name="editPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.message ? <ActionMessage>{state.message}</ActionMessage> : null}
          <AlertDialogFooter>
            <AlertDialogCancel type="button">취소</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "삭제 중" : "삭제하기"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
