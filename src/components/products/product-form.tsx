"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createProductAction, updateProductAction } from "@/app/products/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { PERSON_NAMES, PRICE_OPTIONS } from "@/server/products/constants";

import { ImageUploader } from "./image-uploader";
import type { ActionResult, ProductForView } from "./product-view-types";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CONDITION_LABELS,
  CONDITION_OPTIONS,
  PRICE_DISPLAY_LABELS,
} from "./product-view-types";

type ProductFormAction = (
  previousState: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

const initialState: ActionResult = {
  ok: false,
  message: "",
};

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: ProductForView;
}) {
  const action = (
    mode === "create" ? createProductAction : updateProductAction
  ) as ProductFormAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">사진</h2>
        <ImageUploader initialUrls={product?.imageUrls} />
      </section>
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-sm font-semibold">기본 정보</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">상품명</Label>
            <Input
              id="title"
              name="title"
              defaultValue={product?.title ?? ""}
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">가격</Label>
            <Select name="price" defaultValue={String(product?.price ?? 1000)}>
              <SelectTrigger id="price" className="w-full">
                <SelectValue placeholder="가격을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_OPTIONS.map((price) => (
                  <SelectItem key={price} value={String(price)}>
                    {PRICE_DISPLAY_LABELS[price]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerName">등록자</Label>
            <Select
              name="sellerName"
              defaultValue={product?.sellerName ?? "채영"}
            >
              <SelectTrigger id="sellerName" className="w-full">
                <SelectValue placeholder="이름을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PERSON_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select name="category" defaultValue={product?.category ?? "etc"}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">상품 컨디션</Label>
            <Select name="condition" defaultValue={product?.condition ?? "used"}>
              <SelectTrigger id="condition" className="w-full">
                <SelectValue placeholder="컨디션을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-sm font-semibold">설명과 메모</h2>
        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            rows={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flawNote">하자 메모</Label>
          <Textarea
            id="flawNote"
            name="flawNote"
            defaultValue={product?.flawNote ?? ""}
            rows={3}
          />
        </div>
      </section>
      <div className="space-y-2 border-t pt-6">
        <Label htmlFor="editPassword">수정 비밀번호</Label>
        <Input
          id="editPassword"
          name="editPassword"
          type="password"
          autoComplete={mode === "create" ? "new-password" : "current-password"}
          required
        />
        <p className="text-xs text-muted-foreground">
          저장, 상태 변경, 삭제할 때 다시 확인합니다.
        </p>
      </div>
      {!state.ok && state.message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/">취소</Link>
        </Button>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "저장 중" : mode === "create" ? "등록하기" : "저장하기"}
        </Button>
      </div>
    </form>
  );
}
