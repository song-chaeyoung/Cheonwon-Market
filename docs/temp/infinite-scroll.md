# 상품 목록 무한스크롤 논의 정리

기준 커밋: `6e8b886 feat: add product infinite scroll`

## 현재 구현 상태

- 기존 구조는 페이지네이션이나 무한스크롤이 없었고, `src/app/page.tsx`에서 상품 전체 목록을 조회한 뒤 `ProductList`에 넘기는 구조였다.
- 현재 커밋에서는 첫 페이지를 서버에서 `listProductPage({ limit: 24 })`로 조회하고, 이후 페이지는 클라이언트에서 `/api/products`를 호출해 추가 로드한다.
- 클라이언트 무한스크롤은 외부 라이브러리 없이 `IntersectionObserver` 기반 커스텀 훅으로 구현했다.
- 필터는 기존 클라이언트 상태에서 서버 쿼리 필터로 이동했다.
- 현재 브라우저 주소창 URL은 변경하지 않는다. `URLSearchParams`는 `/api/products` 요청 URL을 만들 때만 사용한다.

관련 파일:

- `src/app/page.tsx`
- `src/components/products/product-list.tsx`
- `src/hooks/use-cursor-infinite.ts`
- `src/hooks/use-infinite-scroll.ts`
- `src/app/api/products/route.ts`
- `src/server/products/repository.ts`
- `src/server/products/pagination.ts`

## 현재 구조

```txt
Home page
  -> listProductPage({ limit: 24 })
  -> ProductList(initialProducts, initialCursor)
      -> useCursorInfinite(...)
      -> useInfiniteScroll(...)
      -> fetch("/api/products?cursor=...&filters=...")
          -> API route
          -> listProductPage({ limit, cursor, filters })
```

## 커서 기반 페이지네이션 판단

커서 기반은 무한스크롤 feed에는 적합하다.

이유:

- offset/page 방식은 중간에 새 상품이 추가되면 중복 또는 누락 가능성이 커진다.
- 커서 방식은 `created_at desc, id desc` 기준으로 다음 구간을 안정적으로 이어갈 수 있다.
- 모바일 퍼스트 여부는 커서 자체의 문제가 아니라, 뒤로가기와 스크롤 복원 UX 문제에 가깝다.

현재 repository 쿼리는 다음 방향이다.

```sql
order by created_at desc, id desc
limit $n
```

추후 데이터가 많아지면 `created_at desc, id desc` 복합 인덱스 검토가 필요하다.

### 마이크로초 정밀도 보존

PostgreSQL `timestamptz`는 마이크로초(6자리) 정밀도를 저장하지만, neon 드라이버가 이를 JavaScript `Date`로 변환하면 밀리초(3자리)까지만 남고 마이크로초가 절삭된다. 이 깎인 값으로 커서를 만들면, 같은 밀리초에 생성된 행들이 커서 술어(`created_at = $1`)에서 누락되어 페이지 경계에서 상품이 사라질 수 있다.

이를 막기 위해 커서의 `createdAt`은 `Date`를 거치지 않고, 쿼리에서 다음과 같이 전체 정밀도 UTC 문자열을 직접 뽑아 구성한다.

```sql
to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as cursor_created_at
```

즉 커서에 쓰는 `cursor_created_at`은 표시용 `createdAt`(밀리초)과 달리 마이크로초 6자리를 보존한다. 키셋 술어 로직 자체는 정확하므로, 정밀도만 맞추면 누락이 발생하지 않는다.

## 라이브러리 사용 여부

단순 무한스크롤이면 `react-intersection-observer` 같은 라이브러리 없이 커스텀 훅으로 충분하다.

현재 구현처럼 직접 만들면 좋은 점:

- 의존성이 늘지 않는다.
- Next.js App Router와 API route 구조에 맞게 제어할 수 있다.
- cursor, abort, reset, error, filter 변경 같은 정책을 직접 설계할 수 있다.

라이브러리를 고려할 수 있는 경우:

- 여러 페이지에서 반복적으로 같은 무한스크롤 패턴을 쓴다.
- intersection observer edge case를 직접 관리하고 싶지 않다.
- team convention상 검증된 UI hook library를 선호한다.

다만 Next.js 전용으로 "무한스크롤만" 해결하는 표준 라이브러리보다는, 일반 React hook이나 data fetching library 조합이 더 흔하다.

## 가벼운 라이브러리 출시 가능성

현재 만든 커스텀 훅을 조금 더 다듬으면, 프로젝트 내부 유틸을 넘어 가벼운 React 무한스크롤 라이브러리 후보로 볼 수 있다.

다만 라이브러리로 분리하려면 현재 상품 도메인과 Next.js 의존을 core에서 제거해야 한다.

분리 기준:

- core package는 React와 browser API만 안다.
- Next.js App Router, URL query, `history.state` 복원은 adapter로 분리한다.
- data fetching library에 의존하지 않는다.
- 사용자가 `getNextPage`, `initialItems`, `initialCursor`를 직접 주입한다.
- cursor 타입은 generic으로 둔다.
- DOM 관찰은 `IntersectionObserver` 기반으로 유지한다.

라이브러리 core 후보 API:

```ts
useCursorInfinite<TItem, TCursor>({
  initialItems,
  initialCursor,
  getNextPage,
  getItemKey,
  enabled,
  rootMargin,
  autoLoadFirstPage,
});
```

반환값 후보:

```ts
{
  items,
  sentinelRef,
  isLoading,
  hasNextPage,
  error,
  loadMore,
  reset,
}
```

adapter 후보:

```ts
useInfiniteUrlSync({
  enabled,
  mode: "off" | "replace" | "push",
  read,
  write,
});

useInfiniteHistoryRestore({
  enabled,
  key,
  maxItems,
  restoreScroll,
});
```

출시 전 정리해야 할 것:

- `ProductForView`, product filter, `/api/products` 같은 앱 도메인 타입 제거
- Next.js `useSearchParams` 직접 의존 제거
- `history.state` merge 전략 문서화
- abort, reset, duplicate request 방지 동작을 테스트로 고정
- jsdom 환경에서 observer mock 테스트 추가
- README에 Next.js 예시와 순수 React 예시를 분리
- package 이름, ESM/CJS 여부, peer dependency 범위 결정

초기 출시 범위는 작게 잡는 것이 좋다.

```txt
v0.1
- cursor 기반 infinite hook
- IntersectionObserver sentinel hook
- abort/reset/error 기본 처리
- URL/history adapter는 examples 또는 optional export
```

라이브러리로 키울 때도 현재 앱 구현은 좋은 dogfooding 대상이다. 먼저 이 프로젝트에서 URL sync와 history restore까지 검증한 뒤, 도메인 의존을 걷어내 package로 분리하는 순서가 안전하다.

## URL 상태 동기화 논의

현재는 URL을 변경하지 않는다.

앞으로는 URL 동기화를 옵션으로 분리하는 쪽이 좋다. 특히 라이브러리처럼 확장하려면 core hook은 URL이나 Next.js를 몰라야 한다.

권장 분리:

```ts
useCursorInfinite(...) // 순수 무한스크롤 core. URL 모름.

useProductFiltersUrlSync({
  enabled: true | false,
  mode: "replace" | "push",
}) // URL adapter.

useProductFeedHistoryRestore({
  enabled: true | false,
}) // 뒤로가기 복원 adapter.
```

URL에 넣을 값:

- `freeOnly`
- `unreservedOnly`
- `sellerName`
- `purchaseName`

URL에 넣지 않는 것이 나은 값:

- `cursor`

이유:

- 필터는 공유 가능한 의미 상태다.
- cursor는 내부 로딩 진행 상태에 가깝고, URL을 지저분하게 만든다.
- cursor URL은 공유/새로고침 시 의미가 애매해질 수 있다.

## `pushState`와 `replaceState`

Next.js 16 문서 기준으로 native `window.history.pushState`와 `window.history.replaceState`는 Next Router와 연동되고 `useSearchParams`와 동기화된다.

선택 기준:

- `replaceState`: 필터 변경으로 history stack을 늘리지 않는다. 모바일 기본값으로 적합하다.
- `pushState`: 필터 변경을 브라우저 뒤로가기로 하나씩 되돌리고 싶을 때 사용한다.
- `off`: URL을 전혀 건드리지 않는다.

권장 기본값:

```ts
urlSync: {
  enabled: true,
  mode: "replace",
  include: ["filters"],
}
```

## 브라우저 뒤로가기만으로 충분한가

브라우저 뒤로가기는 사용할 수 있다. 다만 역할을 나눠야 한다.

브라우저 history가 잘 처리할 수 있는 것:

- URL query에 들어간 필터 상태
- 이전 페이지로 이동
- 경우에 따라 기본 scroll restoration

브라우저 history만으로 부족한 것:

- React state 안에 있던 `items`
- 다음 페이지 cursor
- 이미 몇 페이지까지 불러왔는지
- 상품 목록 높이가 복원되기 전의 정확한 scroll 위치

따라서 뒤로가기 UX를 제대로 만들려면 URL 외에 feed snapshot 복원 전략이 필요하다.

## `sessionStorage` 사용안 논의

`sessionStorage`를 쓰면 `items`, `nextCursor`, `scrollY`, `filters`를 저장해 복원할 수 있다.

하지만 `sessionStorage`를 사용하지 않는 방향을 원하면 선택지는 두 가지다.

### 1. URL에 `take`를 넣는 방식

예시:

```txt
/?freeOnly=true&sellerName=...&take=72
```

동작:

- 처음 진입은 24개 조회
- 무한스크롤로 48개까지 로드하면 URL을 `take=48`로 갱신
- 뒤로가기 시 서버가 `take=48`을 읽고 처음부터 48개를 내려줌
- 브라우저 scroll restoration이 동작할 수 있는 높이를 확보함

장점:

- `sessionStorage`가 필요 없다.
- 새로고침과 공유에도 어느 정도 재현 가능하다.

단점:

- `take=120`이면 HTTP 요청 120개가 아니라, 한 번에 상품 120개를 내려받는 큰 요청이 된다.
- 현재 API는 기본 24개, 최대 60개 제한이다.
- 많이 내린 사용자가 뒤로오면 첫 요청이 커진다.
- 새 상품이 추가되면 예전 feed snapshot과 완전히 같지는 않을 수 있다.

판단:

- 부담이 있어 기본 전략으로는 애매하다.
- 쓰더라도 `maxTake` 상한이 필요하다.

### 2. `history.state`를 쓰는 방식

URL에는 필터만 두고, 브라우저 history entry에 feed snapshot을 붙인다.

예시:

```ts
window.history.replaceState(
  {
    ...window.history.state,
    productFeed: {
      items,
      nextCursor,
      scrollY: window.scrollY,
      filters,
    },
  },
  "",
  currentUrl,
);
```

장점:

- `sessionStorage`를 쓰지 않는다.
- URL이 지저분해지지 않는다.
- 뒤로가기 history entry에 붙는 상태라 브라우저 뒤로가기 의미와 잘 맞는다.
- `take=120`처럼 큰 재조회가 필요 없다.

주의점:

- Next.js도 `history.state`를 사용하므로 기존 state를 덮어쓰면 안 된다.
- 반드시 `...window.history.state`로 merge해야 한다.
- 너무 많은 상품 객체를 넣으면 history state가 커질 수 있다.
- 새로고침까지 완벽하게 복원하는 방식은 아니다. 뒤로가기 복귀 UX용이다.

권장 옵션:

```ts
historyRestore: {
  enabled: true,
  maxItems: 60,
  restoreScroll: true,
}
```

## 현재 기준 추천안

가장 현실적인 다음 단계는 다음 조합이다.

```ts
urlSync: {
  enabled: true,
  mode: "replace",
  include: ["filters"],
}

historyRestore: {
  enabled: true,
  maxItems: 60,
  restoreScroll: true,
}
```

정리:

- 무한스크롤은 자동 유지한다.
- "더보기" 버튼은 넣지 않는다.
- URL에는 필터만 반영한다.
- cursor는 URL에 넣지 않는다.
- `sessionStorage`는 쓰지 않는다.
- 뒤로가기 복원은 `history.state` 기반으로 시도한다.
- `take` 방식은 fallback 또는 별도 옵션으로만 고려한다.
- 라이브러리 출시 가능성을 고려해 core hook과 Next.js/browser adapter를 분리한다.

## 구현 시 주의할 점

- URL adapter와 infinite scroll core hook을 분리한다.
- Next.js `history.state`를 덮어쓰지 않고 merge한다.
- 필터 변경 시 기존 로딩 요청은 abort되어야 한다.
- 필터 변경 시 기존 feed snapshot과 cursor는 초기화되어야 한다.
- history snapshot은 너무 커지지 않게 `maxItems`로 제한한다.
- scroll 복원은 items 렌더 후 `requestAnimationFrame` 또는 effect 타이밍에서 처리해야 한다.
- URL 동기화 모드는 `off | replace | push` 정도로 열어둔다.
- 라이브러리 후보 API는 앱 도메인 타입을 포함하지 않게 유지한다.
- package 분리를 서두르기보다 이 앱에서 먼저 dogfooding한다.

## 검증 기준

다음 작업을 구현한다면 최소 검증은 필요하다.

- 필터 변경 시 URL query가 기대대로 바뀌는지
- `replace` 모드에서 뒤로가기 history가 과하게 쌓이지 않는지
- `push` 모드에서 뒤로가기로 이전 필터가 복원되는지
- 상세 페이지 이동 후 뒤로왔을 때 로드된 상품과 스크롤 위치가 복원되는지
- `history.state` merge가 Next.js navigation을 깨지 않는지
- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm build`
