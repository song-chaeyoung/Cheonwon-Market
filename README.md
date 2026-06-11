# 천원마켓

친구들끼리 안 쓰는 물건을 가볍게 올리고 예약하는 미니 플리마켓 웹입니다.

천원마켓은 일반 중고거래 플랫폼이 아니라, 서로 아는 사람들끼리 쓰는 작은 예약 게시판에 가깝습니다. 상품을 올리고, 사진과 가격을 확인하고, 누가 예약할지 고르는 흐름에 집중합니다. 결제, 채팅, 배송, 위치 안내, 회원가입은 1차 MVP 범위에 포함하지 않습니다.

## 주요 기능

- 상품 목록 보기
- 상품 상세 모달
- 상품 등록, 수정, 삭제
- 상품당 이미지 1~5장 업로드
- 가격 선택: 공짜, 500원, 1,000원
- 예약자 선택 및 변경
- 판매 상태 관리: 판매중, 예약중, 거래완료
- 상품별 수정 비밀번호 검증
- 친구 모임용 공통 입장 코드

## 사용 흐름

처음 접속하면 공통 입장 코드를 입력합니다. 입장 코드가 맞으면 상품 목록을 볼 수 있고, 상품 등록과 예약자 변경을 할 수 있습니다.

상품 등록자는 상품명, 가격, 이미지, 설명, 등록자 이름, 수정 비밀번호를 입력합니다. 수정 비밀번호는 상품 수정, 상태 변경, 삭제에 사용되며 원문은 저장하지 않습니다.

예약은 상품 상세 모달에서 처리합니다. 예약자는 없음, 채영, 유나, 비주 중에서 선택할 수 있고, 예약자 변경에는 상품 수정 비밀번호를 요구하지 않습니다. 단, 거래완료 상품은 예약자를 바꿀 수 없습니다.

## 접근 정책

천원마켓은 개인 로그인이나 회원가입을 제공하지 않습니다. 대신 친구 모임 외부인이 상품과 예약자를 임의로 바꾸는 것을 줄이기 위해 공통 입장 코드를 사용합니다.

공통 입장 코드는 완전한 인증 수단이 아니라 친구 모임용 최소 접근 제한입니다. Server Actions와 Route Handlers에서도 접근 허용 상태를 확인합니다.

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Neon Postgres
- `@neondatabase/serverless`
- Vercel Blob
- raw SQL

## 환경 변수

`.env.example`을 참고해 `.env.local`을 설정합니다.

```txt
DATABASE_URL=
MARKET_ENTRY_CODE=
MARKET_ACCESS_COOKIE_SECRET=
BLOB_READ_WRITE_TOKEN=
SITE_URL=
```

`SITE_URL`은 선택값입니다. canonical URL과 소셜 미리보기 URL을 명시하고 싶을 때 사용합니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 명령어

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm verify
```

DB 마이그레이션은 다음 명령으로 실행합니다.

```bash
pnpm db:migrate
```

실행 전 확인만 하려면 다음 명령을 사용합니다.

```bash
pnpm db:migrate:dry-run
```

## 문서

- [MVP 명세](https://github.com/song-chaeyoung/Cheonwon-Market/blob/main/docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md): `docs/superpowers/specs/2026-06-10-cheonwon-market-mvp-design.md`
- [구현 계획](https://github.com/song-chaeyoung/Cheonwon-Market/blob/main/docs/superpowers/plans/2026-06-10-cheonwon-market-mvp.md): `docs/superpowers/plans/2026-06-10-cheonwon-market-mvp.md`
- [디자인 방향](https://github.com/song-chaeyoung/Cheonwon-Market/blob/main/docs/design/cheonwon-market-visual-design-improvement.md): `docs/design/cheonwon-market-visual-design-improvement.md`
