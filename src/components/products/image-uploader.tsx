"use client";

import Image from "next/image";
import { type ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_IMAGES = 5;

type UploadResponse = {
  urls?: string[];
  message?: string;
};

export function ImageUploader({
  initialUrls = [],
}: {
  initialUrls?: string[];
}) {
  const [imageUrls, setImageUrls] = useState(initialUrls);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    if (imageUrls.length + files.length > MAX_IMAGES) {
      setMessage("이미지는 1장 이상 5장 이하로 올려주세요.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok || !data.urls) {
        setMessage(data.message ?? "이미지를 올리지 못했어요.");
        return;
      }

      setImageUrls((current) => [...current, ...data.urls!].slice(0, MAX_IMAGES));
    } catch {
      setMessage("이미지를 올리지 못했어요.");
    } finally {
      setPending(false);
      event.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImageUrls((current) => current.filter((item) => item !== url));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="product-images">이미지</Label>
        <Input
          id="product-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          disabled={pending || imageUrls.length >= MAX_IMAGES}
        />
        <p className="text-xs text-muted-foreground">
          1장 이상 5장 이하, JPG/PNG/WebP 파일을 올려주세요.
        </p>
      </div>
      {imageUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {imageUrls.map((url, index) => (
            <div key={url} className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={url}
                  alt={`상품 이미지 ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 20vw, 50vw"
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-sm bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    대표
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => removeImage(url)}
              >
                삭제
              </Button>
              <input type="hidden" name="imageUrls" value={url} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-6 text-center text-sm text-muted-foreground">
          아직 올린 이미지가 없어요.
        </div>
      )}
      {pending ? (
        <p className="text-sm text-muted-foreground">업로드 중</p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
