# 천원마켓 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 친구 모임용 천원마켓 1차 MVP를 Next.js 16, Neon Postgres, Vercel Blob, shadcn/ui로 구현합니다.

**Architecture:** 서버 전용 DAL을 `src/server/*`에 두고, App Router 페이지와 Server Actions는 이 DAL만 호출합니다. 이미지는 Server Action 본문 크기 제한을 피하기 위해 접근 쿠키를 검증하는 Route Handler로 업로드하고, 상품 mutation은 Server Actions 중심으로 처리합니다.

**Tech Stack:** Next.js 16.2.9, React 19.2, TypeScript, Tailwind CSS v4, shadcn/ui, `@neondatabase/serverless`, `@vercel/blob`, raw SQL, Node `crypto`.

---

## 근거

- MVP 범위는 상품 목록, 상세 모달, 등록, 수정, 삭제, 다중 이미지, 예약자 변경, 상태 변경, 수정 비밀번호, 공통 입장 코드입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:26`.
- 제외 범위는 검색, 필터, 로그인, 회원가입, 결제, 채팅, 배송, 지도, 연락처, 찜, 알림, 관리자입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:42`.
- 페이지는 `/`, `/products/new`, `/products/[id]/edit`이고 상세는 별도 라우트가 아니라 목록의 모달입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:75`.
- 공통 입장 코드는 환경 변수와 접근 허용 쿠키로 관리하며 Server Actions와 Route Handlers도 접근 상태를 확인해야 합니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:91`.
- DB는 Neon Postgres, `@neondatabase/serverless`, ORM 없는 raw SQL입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:11`.
- 이미지 정책은 상품당 1~5장, jpeg/png/webp, 장당 5MB, Vercel Blob, DB에는 URL 배열입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:248`.
- 예약자 변경은 비밀번호 없이 접근 허용 사용자 누구나 가능하지만 `completed`는 변경 불가입니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:264`.
- 수정/상태 변경/거래완료/삭제는 상품별 수정 비밀번호를 다시 검증해야 합니다: `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md:304`.
- Next 16 로컬 문서 기준 `cookies()`는 async이고 set/delete는 Server Function 또는 Route Handler에서 해야 합니다: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md:6`.
- Server Functions는 UI 밖의 direct POST로도 도달 가능하므로 함수 내부에서 권한을 검증해야 합니다: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md:31`.
- Route Handlers는 public HTTP endpoint이므로 자체 권한 검증이 필요합니다: `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md:48`.
- 동적 page `params`는 Promise이며 `await params`가 필요합니다: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md:40`.
- Server Action request body 기본 제한은 1MB입니다. 이미지 파일을 Server Action으로 직접 받으면 `serverActions.bodySizeLimit` 검토가 필요합니다: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md:24`.

## 실행 원칙

- 구현 전 `git status --short --untracked-files=all`을 확인하고 기존 사용자 변경을 되돌리지 않습니다.
- `AGENTS.md` 지침대로 코드 작성 전 관련 Next 문서를 `node_modules/next/dist/docs/`에서 다시 확인합니다.
- 하위 에이전트는 disjoint write set을 갖게 합니다. 같은 파일을 두 에이전트에게 동시에 맡기지 않습니다.
- 시니어 담당자는 각 에이전트 결과를 그대로 신뢰하지 않고 diff, 타입, 테스트, 빌드, 브라우저 동작을 독립 검증합니다.
- MVP 제외 범위는 구현하지 않습니다. 검색/필터/로그인/관리자 링크도 만들지 않습니다.

## 파일 구조

**Create**
- `db/migrations/0001_create_products.sql`: `products` 테이블, constraint, index, `updated_at` 트리거.
- `src/server/env.ts`: 서버 전용 환경 변수 파서.
- `src/server/db.ts`: Neon raw SQL 클라이언트.
- `src/server/access.ts`: 공통 입장 코드 검증, 서명 쿠키 발급/검증, `requireMarketAccess()`.
- `src/server/password.ts`: `scrypt` 해시/검증과 `timingSafeEqual`.
- `src/server/products/constants.ts`: 가격, 상태, 이름, 카테고리, 컨디션 상수와 라벨.
- `src/server/products/types.ts`: DB row, DTO, action state 타입.
- `src/server/products/validation.ts`: form/input 검증.
- `src/server/products/repository.ts`: raw SQL query 함수.
- `src/server/products/service.ts`: access/password/image cleanup을 조합한 비즈니스 흐름.
- `src/server/images/policy.ts`: 이미지 개수, MIME, 크기 검증.
- `src/server/images/blob.ts`: Vercel Blob adapter.
- `src/app/enter/page.tsx`: 입장 코드 화면.
- `src/app/enter/actions.ts`: 입장 코드 Server Action.
- `src/app/api/images/route.ts`: 이미지 업로드 Route Handler.
- `src/app/products/actions.ts`: 상품 등록/수정/삭제/예약자/상태 Server Actions.
- `src/app/products/new/page.tsx`: 상품 등록 페이지.
- `src/app/products/[id]/edit/page.tsx`: 상품 수정 페이지.
- `src/components/access/access-code-screen.tsx`: 입장 코드 form.
- `src/components/products/product-list.tsx`: 목록과 상세 모달 상태.
- `src/components/products/product-card.tsx`: 상품 카드.
- `src/components/products/product-detail-dialog.tsx`: 상세 모달.
- `src/components/products/reservation-select.tsx`: 예약자 변경 UI.
- `src/components/products/product-form.tsx`: 등록/수정 공용 form.
- `src/components/products/image-uploader.tsx`: 파일 선택, 업로드, 미리보기.
- `src/components/products/password-confirm-dialog.tsx`: 수정 진입 전 비밀번호 확인.
- `src/components/products/delete-product-dialog.tsx`: 삭제 확인.
- `src/components/products/status-badge.tsx`: 상태 표시.
- `src/components/products/empty-products.tsx`: 빈 목록 메시지.
- `tests/unit/product-policy.test.ts`: 상수, 포맷, 상태 전이, 검증.
- `tests/unit/image-policy.test.ts`: 이미지 정책.
- `tests/contracts/product-schema.contract.test.ts`: SQL constraint/index 계약.
- `tests/contracts/access-code.contract.test.ts`: 접근 쿠키 계약.
- `tests/contracts/product-actions.contract.test.ts`: Server Action 권한/비밀번호 계약.
- `tests/contracts/blob-storage.contract.test.ts`: Blob cleanup 계약.
- `tests/e2e/cheonwon-market.spec.ts`: production-like 사용자 흐름.

**Modify**
- `package.json`: `typecheck`, `test`, `test:unit`, `test:contract`, `test:e2e`, `verify` 스크립트.
- `src/app/layout.tsx`: `lang="ko"`, metadata.
- `src/app/page.tsx`: 기본 템플릿을 상품 목록으로 교체.
- `src/app/globals.css`: 기존 shadcn/Tailwind v4 토큰은 유지하고 앱 배경 정도만 최소 조정.
- `next.config.ts`: 이미지 업로드를 Server Action으로 바꾸는 경우에만 `serverActions.bodySizeLimit` 설정. 기본 계획에서는 Route Handler 업로드라 수정하지 않습니다.

## 하위 에이전트 배정

**Agent A - Backend/Data**
- Owns: `db/migrations/*`, `src/server/**`, `src/app/products/actions.ts`, `src/app/enter/actions.ts`, `src/app/api/images/route.ts`.
- Does not edit: `src/components/**` except 타입 계약 요청 시 리뷰 코멘트만 남깁니다.
- Output: 변경 파일 목록, SQL/권한/비밀번호/Blob cleanup 근거, 실행한 검증 명령.

**Agent B - Frontend/UX**
- Owns: `src/components/access/**`, `src/components/products/**`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/enter/page.tsx`, product pages.
- Does not edit: `src/server/**`, SQL migration.
- Output: 화면별 컴포넌트 구조, MVP 제외 범위 미구현 확인, 모바일/모달 리스크.

**Agent C - Verification**
- Owns: `tests/**`, `vitest.config.mts`, `playwright.config.ts`, test-related `package.json` scripts.
- Does not edit: production logic unless testability hook가 꼭 필요하면 시니어에게 요청합니다.
- Output: 실패/통과 로그, coverage gap, 최종 검증 체크리스트.

**Senior Integrator**
- Owns: task sequencing, conflict resolution, code review, final test/build/browser verification, staged scope proof.
- Reviews: every Server Action/Route Handler has access check, DTO excludes password hash, completed state cannot revert, Blob cleanup behavior, no excluded MVP feature slipped in.

## Task 0: Preflight and Test Harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Confirm current tree**

Run:

```powershell
git status --short --untracked-files=all
corepack pnpm lint
corepack pnpm build
```

Expected:
- Worktree state is known before edits.
- Existing app may build as starter.
- Any failure is recorded before agents start.

- [ ] **Step 2: Add verification scripts**

Add scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:contract": "vitest run tests/contracts",
    "test:e2e": "playwright test",
    "verify": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

If Vitest/Playwright are not installed, request approval before:

```powershell
corepack pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

- [ ] **Step 3: Add minimal config**

`vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "corepack pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
```

- [ ] **Step 4: Commit checkpoint**

Commit only verification scaffolding if the user wants frequent commits:

```powershell
git add package.json pnpm-lock.yaml vitest.config.mts playwright.config.ts
git diff --cached --check
git commit -m "test: add MVP verification harness"
```

## Task 1: Schema and Product Policy

**Files:**
- Create: `db/migrations/0001_create_products.sql`
- Create: `src/server/products/constants.ts`
- Create: `src/server/products/types.ts`
- Create: `src/server/products/format.ts`
- Create: `src/server/products/validation.ts`
- Test: `tests/contracts/product-schema.contract.test.ts`
- Test: `tests/unit/product-policy.test.ts`

- [ ] **Step 1: Write failing schema contract**

Assert the SQL file contains:
- `create table products`
- constraints for price, status, category, condition, seller_name, purchase_name, purchase/status consistency, image cardinality.
- indexes on `created_at desc`, `price`, `status`.

- [ ] **Step 2: Write policy tests**

Cover:
- `PRICE_OPTIONS` equals `[0, 500, 1000]`.
- labels are `공짜`, `500원`, `1,000원`.
- valid transitions are exactly `available -> reserved`, `available -> completed`, `reserved -> available`, `reserved -> completed`.
- seller/purchase names are exactly `채영`, `유나`, `비주`.
- defaults are category `etc` and condition `used`.

- [ ] **Step 3: Implement migration**

Use spec SQL as base and add update timestamp support:

```sql
create extension if not exists pgcrypto;

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price integer not null,
  category text not null default 'etc',
  condition text not null default 'used',
  status text not null default 'available',
  image_urls text[] not null,
  seller_name text not null,
  purchase_name text default null,
  flaw_note text,
  edit_password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_check check (price in (0, 500, 1000)),
  constraint products_status_check check (status in ('available', 'reserved', 'completed')),
  constraint products_category_check check (category in ('clothes', 'electronics', 'books', 'living', 'hobby', 'etc')),
  constraint products_condition_check check (condition in ('like_new', 'good', 'used', 'flawed')),
  constraint products_seller_name_check check (seller_name in ('채영', '유나', '비주')),
  constraint products_purchase_name_check check (purchase_name is null or purchase_name in ('채영', '유나', '비주')),
  constraint products_purchase_status_check check (
    (status = 'available' and purchase_name is null)
    or (status = 'reserved' and purchase_name is not null)
    or status = 'completed'
  ),
  constraint products_image_urls_check check (cardinality(image_urls) between 1 and 5)
);
```

- [ ] **Step 4: Implement policy modules**

Keep all labels in one module so UI and server validation share the same source.

- [ ] **Step 5: Verify**

Run:

```powershell
corepack pnpm test:unit
corepack pnpm test:contract
```

Expected: schema and product policy tests pass.

## Task 2: Access Code and Server Boundaries

**Files:**
- Create: `src/server/env.ts`
- Create: `src/server/access.ts`
- Create: `src/app/enter/actions.ts`
- Create: `src/app/enter/page.tsx`
- Create: `src/components/access/access-code-screen.tsx`
- Test: `tests/contracts/access-code.contract.test.ts`

- [ ] **Step 1: Define env contract**

Required environment variables:

```txt
DATABASE_URL
MARKET_ENTRY_CODE
MARKET_ACCESS_COOKIE_SECRET
BLOB_READ_WRITE_TOKEN
```

Do not print real values in logs or tests.

- [ ] **Step 2: Implement signed access cookie**

Cookie:

```ts
const MARKET_ACCESS_COOKIE = "cheonwon_market_access";
```

Requirements:
- `httpOnly: true`
- `sameSite: "lax"`
- `secure: process.env.NODE_ENV === "production"`
- `path: "/"`
- value is a signed token, not the raw entry code.

- [ ] **Step 3: Implement access action**

`submitEntryCodeAction(prevState, formData)`:
- compares submitted code with `MARKET_ENTRY_CODE`.
- on success sets cookie and redirects to `/`.
- on failure returns `{ ok: false, message: "입장 코드가 맞지 않아요." }`.

- [ ] **Step 4: Gate app routes**

Use `requireMarketAccess()` in:
- `/` page before product query.
- `/products/new` page.
- `/products/[id]/edit` page.
- every mutation Server Action.
- image Route Handler.

- [ ] **Step 5: Verify**

Run:

```powershell
corepack pnpm test:contract -- tests/contracts/access-code.contract.test.ts
corepack pnpm typecheck
```

Expected: async `cookies()` usage is type-correct and direct mutation without access is rejected.

## Task 3: Repository, Password, and Product Service

**Files:**
- Create: `src/server/db.ts`
- Create: `src/server/password.ts`
- Create: `src/server/products/repository.ts`
- Create: `src/server/products/service.ts`
- Test: `tests/contracts/product-actions.contract.test.ts`

- [ ] **Step 1: Implement DB client**

`src/server/db.ts`:
- import `"server-only"`.
- create `sql` from `neon(getEnv().DATABASE_URL)`.
- export repository helpers, not the client to UI modules.

- [ ] **Step 2: Implement password hashing**

Use `node:crypto` `scrypt`, random salt, and `timingSafeEqual`.

Stored format:

```txt
scrypt:<saltHex>:<hashHex>
```

- [ ] **Step 3: Implement repository**

Functions:
- `listProducts()`
- `getProductById(id)`
- `createProduct(input)`
- `updateReservation(id, purchaseName)`
- `verifyProductPassword(id, password)`
- `updateProduct(id, input, password)`
- `updateProductStatus(id, status, password)`
- `deleteProduct(id, password)`

DTO must never include `edit_password_hash`.

- [ ] **Step 4: Implement reservation SQL exactly**

```sql
update products
set purchase_name = $1,
    status = case
      when $1 is null then 'available'
      else 'reserved'
    end,
    updated_at = now()
where id = $2
  and status <> 'completed';
```

- [ ] **Step 5: Verify**

Run:

```powershell
corepack pnpm test:contract -- tests/contracts/product-actions.contract.test.ts
corepack pnpm typecheck
```

Expected: password-required mutations reject bad passwords; reservation change does not require edit password; completed reservation change returns the spec failure message.

## Task 4: Image Upload Route and Blob Cleanup

**Files:**
- Create: `src/server/images/policy.ts`
- Create: `src/server/images/blob.ts`
- Create: `src/app/api/images/route.ts`
- Test: `tests/unit/image-policy.test.ts`
- Test: `tests/contracts/blob-storage.contract.test.ts`

- [ ] **Step 1: Write image policy tests**

Cover:
- 0 files fails with `이미지는 1장 이상 5장 이하로 올려주세요.`
- 6 files fails.
- unsupported MIME fails.
- file size over 5MB fails.

- [ ] **Step 2: Implement Route Handler**

`POST /api/images`:
- calls `requireMarketAccess()`.
- parses multipart form data.
- validates file count, MIME, size.
- uploads each file to Vercel Blob.
- returns `{ urls: string[] }`.

- [ ] **Step 3: Implement cleanup adapter**

Expose:
- `uploadProductImage(file): Promise<string>`
- `deleteProductImages(urls): Promise<void>`

Blob delete failure should be logged and not reverse an already successful product delete.

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm test:unit -- tests/unit/image-policy.test.ts
corepack pnpm test:contract -- tests/contracts/blob-storage.contract.test.ts
corepack pnpm build
```

Expected: no Server Action body size workaround is required because files go through Route Handler.

## Task 5: Product Create Flow

**Files:**
- Create: `src/app/products/actions.ts`
- Create: `src/app/products/new/page.tsx`
- Create: `src/components/products/product-form.tsx`
- Create: `src/components/products/image-uploader.tsx`
- Modify: `src/app/page.tsx` only for navigation after redirect if needed.

- [ ] **Step 1: Create action contract**

`createProductAction(prevState, formData)`:
- calls `requireMarketAccess()`.
- validates title, price, image URLs, sellerName, category, condition, password.
- hashes password server-side.
- inserts product.
- calls `revalidatePath("/")`.
- redirects to `/`.

- [ ] **Step 2: Build form UI**

Fields:
- title
- price fixed options: 공짜, 500원, 1,000원
- images 1~5
- description
- sellerName select: 채영, 유나, 비주
- category select defaulting to server `etc`
- condition select defaulting to server `used`
- flawNote
- edit password

- [ ] **Step 3: Verify**

Run:

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Expected: form compiles, no excluded login/search/filter UI exists.

## Task 6: Product List, Detail Modal, and Reservation

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/products/product-list.tsx`
- Create: `src/components/products/product-card.tsx`
- Create: `src/components/products/product-detail-dialog.tsx`
- Create: `src/components/products/reservation-select.tsx`
- Create: `src/components/products/status-badge.tsx`
- Create: `src/components/products/empty-products.tsx`
- Modify: `src/app/products/actions.ts`

- [ ] **Step 1: Replace starter page**

`/`:
- calls `requireMarketAccess()`.
- calls `listProducts()` directly, not via local Route Handler fetch.
- renders empty message:

```txt
아직 등록된 상품이 없어요.
첫 번째 상품을 올려보세요.
```

- [ ] **Step 2: Build card and modal**

Constraints:
- no separate product detail route.
- first image uses fixed aspect ratio.
- detail `DialogContent` uses wider responsive width and vertical scroll.
- `SelectTrigger` gets `className="w-full"`.

- [ ] **Step 3: Implement reservation action**

`changeReservationAction(productId, purchaseName)`:
- calls `requireMarketAccess()`.
- accepts `null | "채영" | "유나" | "비주"`.
- updates `purchase_name` and `status` together.
- does not require edit password.
- returns success message `예약자가 변경되었어요.`
- returns completed failure message `거래가 완료된 상품은 예약자를 바꿀 수 없어요.`

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm test:contract
corepack pnpm build
```

Manual browser checks:
- modal opens from product card.
- reservation select disabled for `completed`.
- reservation success/failure messages match spec.

## Task 7: Edit, Status, and Delete Flow

**Files:**
- Create: `src/app/products/[id]/edit/page.tsx`
- Create: `src/components/products/password-confirm-dialog.tsx`
- Create: `src/components/products/delete-product-dialog.tsx`
- Modify: `src/components/products/product-detail-dialog.tsx`
- Modify: `src/components/products/product-form.tsx`
- Modify: `src/app/products/actions.ts`

- [ ] **Step 1: Implement password gate**

From detail modal:
- user clicks `수정하기`.
- opens password confirm UI.
- calls `verifyEditPasswordAction(productId, password)`.
- on success navigates to `/products/[id]/edit`.
- actual edit page still asks for password again on save/delete/status change.

- [ ] **Step 2: Implement edit page**

Page signature must use Promise params:

```ts
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

- [ ] **Step 3: Implement mutations**

Actions:
- `updateProductAction`
- `changeStatusAction`
- `deleteProductAction`

Rules:
- each calls `requireMarketAccess()`.
- each verifies edit password.
- `completed` cannot revert.
- delete removes DB row first, then attempts Blob cleanup.
- wrong password returns `수정 비밀번호가 일치하지 않아요.`

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm test:contract
corepack pnpm typecheck
corepack pnpm build
```

Manual browser checks:
- wrong password blocks edit/delete/status mutation.
- completed status cannot revert.
- delete confirmation is explicit.

## Task 8: E2E and Final Review

**Files:**
- Create: `tests/e2e/cheonwon-market.spec.ts`
- Modify only if needed: `playwright.config.ts`

- [ ] **Step 1: Write E2E smoke flow**

Flow:
- first visit shows entry code screen.
- correct entry code opens `/`.
- create product with 1 image.
- product appears in list.
- detail modal opens.
- reservation changes to one of allowed names.
- edit password failure shows error.
- edit password success opens edit page.
- status changes to 거래완료.
- reservation select is disabled on completed product.
- delete flow removes product.

- [ ] **Step 2: Run full verification**

Run:

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test:unit
corepack pnpm test:contract
corepack pnpm build
corepack pnpm test:e2e
```

Expected: all pass. If browser automation is unavailable in the environment, state that gap and fall back to code inspection plus lint/typecheck/test/build evidence.

- [ ] **Step 3: Senior review checklist**

Check:
- no UI-only authorization.
- every mutation Server Action has access check.
- every image Route Handler has access check.
- DTO never exposes `edit_password_hash`.
- no raw password stored or logged.
- reservation changes are password-free but access-gated.
- `completed` cannot revert.
- Blob cleanup failure does not reverse user-facing delete success.
- no excluded MVP feature appears.
- Korean UI copy matches spec.
- responsive UI has no overlapping text or clipped buttons.

- [ ] **Step 4: Optional scoped commit**

Before committing:

```powershell
git status --short --untracked-files=all
git diff --name-only
git add <explicit files only>
git diff --cached --name-only
git diff --cached --check
git commit -m "feat: implement cheonwon market mvp"
git show --stat --oneline --name-only HEAD
```

## Execution Waves

**Wave 1 - independent foundation**
- Agent A: Task 1 DB schema and product policy.
- Agent C: Task 0 test harness and first contract tests.
- Senior: review Next docs and resolve package/test dependency approvals.

**Wave 2 - server behavior**
- Agent A: Task 2 access, Task 3 repository/password/service, Task 4 image route.
- Agent C: contract tests for access/actions/blob cleanup.
- Senior: review auth boundary and direct POST/Route Handler risk.

**Wave 3 - UI and integration**
- Agent B: Task 5 create form, Task 6 list/detail/reservation, Task 7 edit/delete/status UI.
- Agent A: Server Actions wiring support only.
- Senior: merge conflicts, DTO shape, final UI behavior.

**Wave 4 - final verification**
- Agent C: Task 8 E2E.
- Senior: final lint/typecheck/test/build/browser review and scoped commit proof.
