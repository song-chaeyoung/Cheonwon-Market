"use client";

import Image from "next/image";
import { useActionState } from "react";

import { submitEntryCodeAction } from "@/app/enter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccessCodeState = {
  ok?: boolean;
  message?: string;
};

const initialState: AccessCodeState = {
  ok: false,
  message: "",
};

export function AccessCodeScreen() {
  const [state, formAction, pending] = useActionState(
    submitEntryCodeAction,
    initialState,
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6">
        <div className="space-y-3">
          <Image
            src="/brand/cheonwon-mark.svg"
            alt=""
            width={56}
            height={42}
            unoptimized
          />
          <p className="text-sm font-semibold text-primary">천원마켓</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            입장 코드를 입력해주세요
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            친구 모임에서 공유한 공통 입장 코드로 들어갈 수 있어요.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryCode">입장 코드</Label>
            <Input
              id="entryCode"
              name="entryCode"
              type="password"
              autoComplete="off"
              required
              placeholder="코드를 입력하세요"
            />
          </div>
          {!state.ok && state.message ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "확인 중" : "입장하기"}
          </Button>
        </form>
      </section>
    </main>
  );
}
