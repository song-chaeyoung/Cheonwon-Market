"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

import { verifyEditPasswordAction } from "@/app/products/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionMessage } from "@/components/ui/action-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordConfirmDialog({
  productId,
  trigger,
}: {
  productId: string;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("editPassword") ?? "");

    setPending(true);
    setMessage(null);
    const result = await verifyEditPasswordAction(productId, password);
    setPending(false);

    if (result?.ok) {
      setOpen(false);
      router.push(`/products/${productId}/edit`);
      return;
    }

    setMessage(result?.message ?? "수정 비밀번호를 확인해주세요.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>수정 비밀번호 확인</DialogTitle>
          <DialogDescription>
            상품을 수정하려면 등록할 때 정한 비밀번호가 필요해요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`confirm-password-${productId}`}>
              수정 비밀번호
            </Label>
            <Input
              id={`confirm-password-${productId}`}
              name="editPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {message ? <ActionMessage>{message}</ActionMessage> : null}
          <DialogFooter className="mx-0 mb-0 px-0 pb-0">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "확인 중" : "수정하러 가기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
