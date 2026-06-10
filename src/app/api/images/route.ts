import { NextResponse } from "next/server";

import { MarketAccessError, requireMarketAccess } from "@/server/access";
import { uploadProductImage } from "@/server/images/blob";
import { validateProductImages } from "@/server/images/policy";

export async function POST(request: Request) {
  try {
    await requireMarketAccess();
  } catch (error) {
    if (error instanceof MarketAccessError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    throw error;
  }

  const formData = await request.formData();
  const files = [
    ...formData.getAll("images"),
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((value): value is File => value instanceof File);
  const validation = validateProductImages(files);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const urls = await Promise.all(files.map((file) => uploadProductImage(file)));

  return NextResponse.json({ urls });
}
