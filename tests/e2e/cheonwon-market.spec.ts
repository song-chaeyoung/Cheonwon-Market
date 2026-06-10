import { expect, test } from "@playwright/test";

const requiredEnvKeys = [
  "DATABASE_URL",
  "MARKET_ENTRY_CODE",
  "MARKET_ACCESS_COOKIE_SECRET",
  "BLOB_READ_WRITE_TOKEN",
] as const;

const hasProductionLikeEnv = requiredEnvKeys.every((key) => process.env[key]);

test.describe("천원마켓 MVP flow", () => {
  test.skip(
    !hasProductionLikeEnv,
    "Neon and Vercel Blob environment variables are required for the full E2E flow.",
  );

  test("enters, creates, reserves, edits, completes, and deletes a product", async ({
    page,
  }) => {
    const title = `E2E 머그컵 ${Date.now()}`;
    const password = "test-password-123";

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "입장 코드를 입력해주세요" })).toBeVisible();
    await page.getByLabel("입장 코드").fill(process.env.MARKET_ENTRY_CODE!);
    await page.getByRole("button", { name: "입장하기" }).click();

    await expect(page.getByRole("heading", { name: "천원마켓" })).toBeVisible();
    await page.getByRole("link", { name: "상품 올리기" }).click();

    await page.getByLabel("상품명").fill(title);
    await page.getByLabel("가격").click();
    await page.getByRole("option", { name: "1,000원" }).click();
    await page.getByLabel("등록자").click();
    await page.getByRole("option", { name: "채영" }).click();
    await page.getByLabel("수정 비밀번호").fill(password);
    await page.setInputFiles("#product-images", {
      name: "mug.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect(page.getByAltText("상품 이미지 1")).toBeVisible();
    await page.getByRole("button", { name: "등록하기" }).click();

    await expect(page.getByText(title)).toBeVisible();
    await page.getByText(title).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("예약자").click();
    await page.getByRole("option", { name: "유나" }).click();
    await expect(page.getByText("예약자가 변경되었어요.")).toBeVisible();

    await page.getByRole("button", { name: "수정하기" }).click();
    const passwordDialog = page.getByRole("dialog");
    await passwordDialog.getByLabel("수정 비밀번호").fill("wrong-password");
    await passwordDialog.getByRole("button", { name: "수정하러 가기" }).click();
    await expect(page.getByText("수정 비밀번호가 일치하지 않아요.")).toBeVisible();

    await passwordDialog.getByLabel("수정 비밀번호").fill(password);
    await passwordDialog.getByRole("button", { name: "수정하러 가기" }).click();
    await expect(page.getByRole("heading", { name: "상품 수정" })).toBeVisible();

    const statusForm = page.locator("form").filter({ hasText: "판매 상태" });
    await statusForm.getByLabel("상태").click();
    await page.getByRole("option", { name: "거래완료" }).click();
    await statusForm.getByLabel("수정 비밀번호").fill(password);
    await statusForm.getByRole("button", { name: "상태 변경" }).click();

    await page.getByRole("link", { name: "목록으로" }).click();
    await page.getByText(title).click();
    await expect(page.getByText("거래가 완료된 상품이에요.")).toBeVisible();
    await expect(page.getByLabel("예약자")).toBeDisabled();

    await page.getByRole("button", { name: "수정하기" }).click();
    await passwordDialog.getByLabel("수정 비밀번호").fill(password);
    await passwordDialog.getByRole("button", { name: "수정하러 가기" }).click();
    await page.getByRole("button", { name: "상품 삭제" }).click();
    const deleteDialog = page.getByRole("alertdialog");
    await deleteDialog.getByLabel("수정 비밀번호").fill(password);
    await deleteDialog.getByRole("button", { name: "삭제하기" }).click();
    await expect(page.getByText(title)).toHaveCount(0);
  });
});
