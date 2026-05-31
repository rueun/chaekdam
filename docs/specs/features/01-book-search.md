# 기능 01: 책 검색·선택

> US-2 — 외부 도서 API 로 책을 검색하고, 선택한 책의 메타데이터를 저장한다.

## 입력

- `query: string` (1~100자, 한국어·영어 책 제목 또는 저자명)
- `page: number` (옵션, 기본 1)

## 동작 흐름

1. 사용자가 검색 폼에 키워드 입력 (Client Component)
2. **디바운스 300ms** 후 Server Action 호출 (URL 상태는 nuqs 로 `q` 보관)
3. Server Action 이 `BookSearcher` Port 호출 (네이버 책 API 또는 Google Books)
4. 결과를 카드 목록으로 표시 (표지·제목·저자·간단 요약)
5. 사용자가 책 선택
6. **캐싱 전략**:
   - `books.external_source + external_id` 로 기존 행 조회
   - 있으면 그대로 사용 (book_id 반환)
   - 없으면 Author 먼저 INSERT (이름 매칭, 동명이인은 별도 행)
   - 그 후 Book INSERT
7. 다음 단계 (`features/02-note-capture`) 로 라우팅

## API / Server Action

```typescript
// app/(dashboard)/books/actions.ts
'use server';

export async function searchBooks(query: string, page = 1): Promise<readonly BookSearchResult[]> {
  /* BookSearcher.search() 위임 */
}

export async function selectBook(
  externalSource: 'NAVER' | 'GOOGLE_BOOKS',
  externalData: ExternalBookData,
): Promise<{ bookId: BookId }> {
  /* BookRepository.findOrCreate() 위임 */
}
```

## 도메인 Port

- `BookSearcher.search(query, page): Promise<ExternalBookResult[]>`
- `BookRepository.findByExternal(source, externalId): Promise<Book | null>`
- `BookRepository.save(book): Promise<void>`
- `AuthorRepository.findByName(name): Promise<Author | null>`
- `AuthorRepository.save(author): Promise<void>`

## 예외

| 상황                       | 처리                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| 검색어 빈 문자열           | 거부 (`zod.string().min(1)`)                                          |
| 외부 API 5초 타임아웃      | 에러 메시지 + 재시도 버튼                                             |
| 외부 API 호출 실패         | 1회 재시도 → 실패 시 사용자에게 보고                                  |
| 검색 결과 0개              | "검색 결과 없음" 표시 (다른 키워드 제안)                              |
| Book INSERT 시 동시성 충돌 | UPSERT 패턴 (`on conflict (external_source, external_id) do nothing`) |

## UI 상태

```
idle ──(입력)──> searching ──(응답)──> results
                    │                     │
                    └──(에러)──> error    └──(0개)──> empty
```

- 각 상태별 빈/로딩/에러 UI 명확히
- `<Suspense>` + `<ErrorBoundary>` 로 부분 격리

## 검증

- **도메인 단위**: `Book.fromExternal` 데이터 검증·매핑 테스트
- **통합**: `SupabaseBookRepository` 가 실제로 INSERT/조회 되는지
- **E2E**: 검색 → 선택 → 노트 추가 화면 이동

## 보안·성능

- 외부 API 키는 서버 전용 환경 변수
- 검색 결과는 클라이언트 캐시 (TanStack Query 5분 staleTime)
- 책 메타 INSERT 시 RLS 우회 필요 → 서비스 역할 또는 함수형 정책

## UX 디테일

- 검색어 자동 포커스 (모바일 키보드 즉시)
- 결과 무한 스크롤 또는 "더 보기" 버튼 (페이지네이션)
- 책 카드 탭 시 햅틱 피드백 (모바일)
