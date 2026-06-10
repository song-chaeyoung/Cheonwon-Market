# 천원마켓 1차 MVP 명세

## 1. 목적

천원마켓은 친구들끼리 안 쓰는 물건을 가볍게 올리고 예약하는 미니 플리마켓 웹입니다.
서비스는 중고거래 플랫폼이 아니라, 서로 아는 사람들끼리 쓰는 예약 게시판에 가깝습니다.

웹에서는 상품 등록, 상품 조회, 예약, 수정, 상태 변경까지만 처리합니다.
결제, 채팅, 배송, 연락처 교환, 위치 안내는 제공하지 않습니다.

## 2. 확정 기술 스택

- Frontend / Framework: Next.js, TypeScript
- Styling / UI: Tailwind CSS, shadcn/ui
- Backend: Next.js Server Actions 중심, 필요 시 Route Handlers 병행
- Database: Neon Postgres
- DB Client: `@neondatabase/serverless`
- Image Storage: Vercel Blob
- Deploy: Vercel
- ORM: 사용하지 않음
- Query 방식: raw SQL
- Password: 서버에서만 검증하고 DB에는 해시값만 저장

기획서의 기존 Supabase 전제는 사용하지 않습니다.

## 3. 1차 MVP 포함 범위

- 상품 목록 보기
- 상품 상세 모달
- 상품 등록
- 상품 수정
- 상품 삭제
- 다중 이미지 업로드
- 가격 선택: `1,000원`, `500원`, `공짜`
- 예약자 선택
- 예약자 수정
- 판매 상태 변경
- 상품 수정 비밀번호 검증
- 상품 수정 비밀번호 해시 저장
- 공통 입장 코드

## 4. 1차 MVP 제외 범위

- 검색
- 상태 필터
- 카테고리 필터
- 개인 로그인
- 회원가입
- 결제
- 채팅
- 배송
- 위치 정보
- 지도
- 연락처 입력
- 리뷰
- 평점
- 찜
- 알림
- 신고
- 관리자 페이지

## 5. 후속 기능 후보

- 공짜만 보기
- 상품 검색
- 상태 필터
- 카테고리 필터
- 모바일 상세 UI 개선
- 빈 상태 화면 개선
- 에러 메시지 개선

`공짜만 보기`는 가격이 `0`인 상품만 보여주는 단순 필터로 설계합니다.
1차 MVP에서는 구현하지 않지만, `price`를 정수로 저장해 나중에 쉽게 추가할 수 있게 합니다.

## 6. 페이지 구성

```txt
/
상품 목록 페이지

/products/new
상품 등록 페이지

/products/[id]/edit
상품 수정 페이지
```

상품 상세 페이지는 별도 라우트로 만들지 않습니다.
상품 목록 페이지에서 모달로 상세 정보를 보여줍니다.

## 6-1. 접근 정책

개인 로그인은 제공하지 않습니다.
대신 친구 모임 외부인이 상품과 예약자를 임의로 바꾸는 것을 줄이기 위해 공통 입장 코드를 둡니다.

- 공통 입장 코드는 사용자별 계정이 아닙니다.
- 공통 입장 코드는 환경 변수로 관리합니다.
- 사이트에 처음 접속하면 입장 코드 입력 화면을 보여줍니다.
- 입장 코드가 맞으면 브라우저에 접근 허용 쿠키를 저장합니다.
- 상품 목록, 상품 등록, 상품 수정, 상품 상세 모달, 예약자 변경 요청은 접근 허용 상태에서만 사용할 수 있습니다.
- Server Actions와 Route Handlers도 접근 허용 상태를 확인합니다.

공통 입장 코드는 서비스 보안을 완전히 해결하는 인증 수단이 아니라, 친구 모임용 최소 접근 제한입니다.

## 7. 상품 상태

판매 상태는 상품 예약과 거래 진행 상태를 뜻합니다.

```ts
type ProductStatus = "available" | "reserved" | "completed"
```

| 값 | 화면 표시 | 의미 |
| --- | --- | --- |
| `available` | 판매중 | 예약 가능한 상태 |
| `reserved` | 예약중 | 누군가 예약한 상태 |
| `completed` | 거래완료 | 실제 거래가 끝난 상태 |

허용 상태 전이는 다음으로 제한합니다.

```txt
available -> reserved
available -> completed
reserved -> available
reserved -> completed
```

`available <-> reserved` 전환은 상품 상세 모달의 예약자 셀렉트 변경으로 처리합니다.
이 변경에는 상품 수정 비밀번호를 요구하지 않습니다.

`completed` 상태는 1차 MVP에서 되돌리지 않습니다.

## 8. 가격 정책

가격은 직접 입력하지 않고 정해진 옵션 중 하나만 선택합니다.

```ts
type PriceOption = 0 | 500 | 1000
```

| DB 값 | 화면 표시 |
| ---: | --- |
| `0` | 공짜 |
| `500` | 500원 |
| `1000` | 1,000원 |

`isFree` 같은 별도 필드는 만들지 않습니다.

## 9. 상품 데이터 모델

```ts
type ProductCategory =
  | "clothes"
  | "electronics"
  | "books"
  | "living"
  | "hobby"
  | "etc"

type ProductCondition =
  | "like_new"
  | "good"
  | "used"
  | "flawed"

type PersonName = "채영" | "유나" | "비주"

type Product = {
  id: string
  title: string
  description: string | null
  price: 0 | 500 | 1000
  category: ProductCategory
  condition: ProductCondition
  status: ProductStatus
  imageUrls: string[]
  sellerName: PersonName
  purchaseName: PersonName | null
  flawNote: string | null
  editPasswordHash: string
  createdAt: string
  updatedAt: string
}
```

등록 화면에서 카테고리와 상품 컨디션은 선택 입력처럼 취급합니다.
값을 고르지 않으면 서버에서 기본값을 저장합니다.

- 기본 카테고리: `etc`
- 기본 상품 컨디션: `used`

등록자 이름은 자유 입력하지 않고 셀렉트 박스로 선택합니다.
허용값은 `채영`, `유나`, `비주` 세 명으로 제한합니다.

예약자 이름도 같은 이름 목록을 사용합니다.
예약자 이름은 `purchaseName`으로 저장하며, 예약자가 없으면 `null`입니다.

## 10. DB 테이블 초안

테이블은 MVP에서 `products` 하나로 시작합니다.

```sql
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

  constraint products_price_check
    check (price in (0, 500, 1000)),
  constraint products_status_check
    check (status in ('available', 'reserved', 'completed')),
  constraint products_category_check
    check (category in ('clothes', 'electronics', 'books', 'living', 'hobby', 'etc')),
  constraint products_condition_check
    check (condition in ('like_new', 'good', 'used', 'flawed')),
  constraint products_seller_name_check
    check (seller_name in ('채영', '유나', '비주')),
  constraint products_purchase_name_check
    check (purchase_name is null or purchase_name in ('채영', '유나', '비주')),
  constraint products_purchase_status_check
    check (
      (status = 'available' and purchase_name is null)
      or (status = 'reserved' and purchase_name is not null)
      or status = 'completed'
    ),
  constraint products_image_urls_check
    check (cardinality(image_urls) between 1 and 5)
);

create index products_created_at_idx on products (created_at desc);
create index products_price_idx on products (price);
create index products_status_idx on products (status);
```

`products_price_idx`는 후속 기능인 `공짜만 보기`를 쉽게 추가하기 위한 준비입니다.

## 11. 이미지 정책

1차 MVP부터 다중 이미지 업로드를 지원합니다.

- 상품당 최소 1장, 최대 5장
- 허용 타입: `image/jpeg`, `image/png`, `image/webp`
- 권장 제한: 장당 최대 5MB
- 저장소: Vercel Blob
- DB 저장값: Blob URL 배열

상품 등록 시 이미지를 먼저 Blob에 업로드한 뒤, URL 배열을 DB에 저장합니다.
DB 저장이 실패하면 업로드된 Blob이 남을 수 있으므로, 가능한 범위에서 정리 시도를 합니다.

상품 삭제 시 DB 레코드 삭제와 Blob 삭제를 함께 시도합니다.
Blob 삭제 실패는 별도 로깅 대상으로 보고, 사용자에게는 상품 삭제 결과를 우선 안내합니다.

## 12. 예약자 선택 정책

예약은 상품 상세 모달의 하단 셀렉트 박스에서 처리합니다.
셀렉트 옵션은 `없음`, `채영`, `유나`, `비주`입니다.
`없음`은 서버에 `null`로 전달합니다.

`purchaseName`은 현재 예약자 또는 구매 예정자를 뜻합니다.
예약자가 없으면 `null`입니다.

예약자 셀렉트는 공통 입장 코드를 통과한 사용자는 누구나 수정할 수 있습니다.
상품 수정 비밀번호는 요구하지 않습니다.

변경 규칙은 다음과 같습니다.

| 이전 값 | 새 값 | 저장 결과 |
| --- | --- | --- |
| `null` | 이름 선택 | `purchase_name` 저장, `status = 'reserved'` |
| 이름 | `null` | `purchase_name = null`, `status = 'available'` |
| 이름 | 다른 이름 | `purchase_name` 변경, `status = 'reserved'` |

`completed` 상태의 상품에서는 예약자 셀렉트를 비활성화합니다.
거래완료 상품은 1차 MVP에서 예약자를 바꾸지 않습니다.

서버에서는 선택값이 허용된 이름인지 검증하고, 상품 상태와 예약자를 함께 갱신합니다.

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

영향받은 row가 없으면 이미 삭제되었거나 거래 완료된 상품으로 처리합니다.
친구 모임용 서비스이므로 동시에 여러 명이 바꾸는 경우 마지막 저장값을 현재 예약자로 봅니다.

## 13. 수정 권한 정책

개인 로그인을 제공하지 않으므로 상품별 수정 비밀번호로 최소 권한을 관리합니다.

비밀번호가 필요한 작업은 다음과 같습니다.

- 상품 정보 수정
- 상품 상태 변경
- 거래완료 처리
- 상품 삭제

예약자 선택과 예약자 변경은 상품 상세 모달에서 누구나 수정할 수 있으므로 상품 수정 비밀번호 대상이 아닙니다.
단, 공통 입장 코드를 통과한 사용자만 예약자를 바꿀 수 있습니다.

비밀번호 원문은 저장하지 않습니다.
서버에서 해시를 생성하고 DB에는 `edit_password_hash`만 저장합니다.
수정 페이지 진입뿐 아니라 실제 수정, 삭제, 상태 변경 요청에서도 비밀번호를 다시 검증합니다.

## 14. 주요 사용자 흐름

### 상품 등록

```txt
상품 등록 페이지 접속
-> 상품명 입력
-> 가격 선택
-> 이미지 1~5장 업로드
-> 설명 입력
-> 등록자 이름 선택
-> 수정 비밀번호 입력
-> 등록하기
-> 상품 목록으로 이동
```

### 예약자 선택

```txt
상품 목록 접속
-> 상품 카드 클릭
-> 상세 모달 확인
-> 예약자 셀렉트에서 이름 선택
-> 저장
-> purchaseName 저장
-> 상품 상태가 예약중으로 변경
```

### 상품 수정

```txt
상품 상세 모달에서 수정하기 클릭
-> 수정 비밀번호 입력
-> 검증 성공
-> 수정 페이지 이동
-> 상품 정보 수정
-> 저장
```

### 거래완료 처리

```txt
실제로 만나서 거래 완료
-> 상품 상세 모달에서 수정하기 클릭
-> 수정 비밀번호 입력
-> 상태를 거래완료로 변경
-> 저장
```

## 15. 기본 화면 메시지

```txt
상품이 없을 때:
아직 등록된 상품이 없어요.
첫 번째 상품을 올려보세요.

예약자 변경 완료:
예약자가 변경되었어요.

예약자 변경 실패:
예약자를 바꾸지 못했어요.

거래완료 상품:
거래가 완료된 상품이에요.

거래완료 상품의 예약자 변경:
거래가 완료된 상품은 예약자를 바꿀 수 없어요.

비밀번호 오류:
수정 비밀번호가 일치하지 않아요.

이미지 오류:
이미지는 1장 이상 5장 이하로 올려주세요.
```

## 16. 구현 우선순위

1. DB 스키마와 서버 전용 DB 클라이언트
2. 상품 타입, 상수, 표시 포맷터
3. 상품 목록 조회
4. 상품 등록과 다중 이미지 업로드
5. 상품 상세 모달
6. 예약자 셀렉트와 purchaseName 변경
7. 수정 비밀번호 검증
8. 상품 수정, 상태 변경, 삭제

검색, 필터, 공짜만 보기는 1차 MVP 완료 후 별도 단계에서 추가합니다.
