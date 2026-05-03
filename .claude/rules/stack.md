---
name: 책담 — Next.js + Supabase + Claude API 스택 규칙
description: 프로젝트별 기술 스택 규칙 — App Router, Server Actions, Supabase RLS, Claude vision, Tailwind 컨벤션
type: feedback
---

# 기술 스택 규칙 (chaekdam)

## App Router 구조 (계획)

```
app/
├── (auth)/                          # 라우트 그룹 - 인증
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/                     # 인증 후
│   ├── books/                       # 책 검색·선택
│   ├── notes/                       # 인상 깊은 구절 관리
│   └── discussions/                 # AI 토론 세션
│       ├── [id]/page.tsx
│       └── actions.ts               # Server Actions
├── api/
│   └── webhook/route.ts             # 외부 webhook 한정
├── layout.tsx
└── globals.css

lib/
├── domain/                          # 순수 도메인 (외부 의존 0)
│   ├── book/
│   ├── reading-note/
│   ├── discussion/
│   ├── user/
│   ├── shared/                      # 공통 VO·예외
│   └── ports/                       # 인터페이스만
├── application/                     # 유스케이스
└── infrastructure/                  # Adapter
    ├── supabase/                    # Supabase Adapter
    ├── claude/                      # Claude API Adapter
    └── di-container.ts              # 의존성 주입 조립

components/
├── ui/                              # 재사용 컴포넌트
└── feature/                         # 기능 단위 컴포넌트

supabase/
├── migrations/                      # SQL 마이그레이션
└── seed.sql
```

## Server vs Client 컴포넌트

- **기본은 Server Component** — `"use client"` 없이 작성
- Client 전환 기준:
  - 상호작용 (`onClick`, `onChange`, `useState`)
  - 브라우저 API 사용
  - 라이프사이클 (`useEffect`)
- **Client 컴포넌트는 leaf로** — 트리 깊은 곳에 배치하여 Server 영역 최대화
- **데이터 페칭은 Server에서** — Client에서는 받기만

## 데이터 변경 — Server Actions 우선

Server Action은 **얇은 래퍼**로 유지. 비즈니스 로직은 `lib/application/` 의 유스케이스에 위임.

```typescript
// app/(dashboard)/discussions/actions.ts
'use server';

import { createStartDiscussionUseCase } from '@/lib/infrastructure/di-container';
import { revalidatePath } from 'next/cache';

export async function startDiscussion(formData: FormData) {
  const useCase = await createStartDiscussionUseCase();
  const result = await useCase.execute({
    bookId: formData.get('bookId') as string,
    readingNoteIds: formData.getAll('noteIds') as string[],
  });

  revalidatePath('/discussions');
  return result;
}
```

- Route Handler는 **외부 webhook 전용** (예: Stripe webhook)

## Supabase RLS

- **모든 테이블에 RLS 활성화** — 본인 데이터만 접근
- Service Role Key는 **서버 사이드에서만** (절대 클라이언트 노출 금지)
- 권한 규칙은 RLS + 도메인 Specification **이중 방어** (B 전환 대비)

```sql
-- 본인 노트만 조회 가능
create policy "users can view own notes"
on reading_notes for select
using (auth.uid() = user_id);
```

## Claude API 활용

- **vision multimodal 활용** — 사진 → 구절 추출 + 토론을 한 번에
  - Tesseract / Google Vision 등 **별도 OCR 불필요**
- **프롬프트 캐싱 활용** — 책 메타데이터·시스템 프롬프트 재사용 시 비용 절감
- **스트리밍 응답** — 토론 메시지는 `stream: true` + Server-Sent Events
- API 키는 **환경 변수** (`ANTHROPIC_API_KEY`), 서버 측에서만 호출

## 도메인 객체 패턴

`~/.claude/rules/code-principles.md`의 불변성·정적 팩토리 원칙 적용 (TypeScript 표현):

```typescript
export class ReadingNote {
    private constructor(
        readonly id: string,
        readonly bookId: string,
        readonly source: NoteSource,
        readonly content: string,
        readonly photoUrl: string | null,
        readonly createdAt: Date,
    ) {}

    static fromText(bookId: string, content: string): ReadingNote {
        return new ReadingNote(generateId(), bookId, NoteSource.TEXT, content, null, new Date());
    }

    static fromPhoto(bookId: string, photoUrl: string, extractedText: string): ReadingNote {
        return new ReadingNote(generateId(), bookId, NoteSource.PHOTO, extractedText, photoUrl, new Date());
    }

    static restore(...): ReadingNote { /* Repository에서 사용 */ }
}
```

## TypeScript

- **strict mode 필수** (`"strict": true`)
- `any` 금지 — 모르면 `unknown` 후 좁히기
- Supabase 타입 자동 생성:
  ```bash
  supabase gen types typescript --project-id xxx > lib/infrastructure/supabase/types.gen.ts
  ```

## Tailwind

- **유틸리티 클래스 직접 사용** — `@apply` 남용 금지
- 반복되면 컴포넌트로 추출
- `cn()` 유틸로 조건부 클래스 결합
- 디자인 토큰은 `tailwind.config.ts`의 `theme.extend`에 정의

## 라우트 상수 중앙 관리

URL 경로를 하드코딩하지 않고 `lib/router/routes.ts`에 함수형 상수로 모음.

```typescript
// lib/router/routes.ts
export const ROUTES = {
  HOME: () => '/' as const,
  AUTH: {
    LOGIN: () => '/login' as const,
    SIGNUP: () => '/signup' as const,
  },
  BOOKS: {
    LIST: () => '/books' as const,
    DETAIL: (bookId: string) => `/books/${bookId}` as const,
  },
  NOTES: {
    LIST: () => '/notes' as const,
  },
  DISCUSSIONS: {
    LIST: () => '/discussions' as const,
    DETAIL: (id: string) => `/discussions/${id}` as const,
  },
} as const;
```

사용처: `<Link>`, `redirect()`, `revalidatePath()`, `router.push()` 모두 `ROUTES.X.Y(...)`.

## 폼 + Server Action 통합

zod 스키마 1개로 클라이언트 검증 + Server Action 입력 검증을 모두 처리.

```typescript
// lib/domain/reading-note/schemas.ts (도메인 계층 — 외부 의존 0)
import { z } from 'zod';
export const createNoteSchema = z.object({
  bookId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// app/(dashboard)/notes/actions.ts (Server Action)
('use server');
export async function createNote(formData: FormData) {
  const parsed = createNoteSchema.safeParse({
    bookId: formData.get('bookId'),
    content: formData.get('content'),
  });
  if (!parsed.success) return { error: parsed.error.flatten() };

  const useCase = await createAddReadingNoteUseCase();
  return await useCase.execute(parsed.data);
}

// components/feature/note-capture/note-form.tsx (Client)
('use client');
const form = useForm<CreateNoteInput>({ resolver: zodResolver(createNoteSchema) });
```

→ **단일 진실 공급원**(zod 스키마)을 도메인에 두고 클라·서버 모두 재사용.

## TanStack Query Provider 위치

- **`app/providers.tsx`** 에 `<QueryClientProvider>` 배치 (Client Component)
- **Layout 에서 사용**: `app/layout.tsx` 가 Server, 내부에 Client `<Providers>` 래퍼
- **`staleTime` 명시** + 개발 환경 `<ReactQueryDevtools />` 활성화

## 에러 경계 배치

- **페이지 단위**: Next.js의 `error.tsx` 활용 (라우트 그룹별)
- **위젯 단위**: `<ErrorBoundary>` 로 토론 채팅·노트 목록 등 부분 격리
- **Suspense 와 함께**: 로딩(`<Suspense>`)과 에러(`<ErrorBoundary>`) 두 상태 모두 처리

## URL 쿼리 상태 (nuqs)

책 검색·필터·페이지네이션을 URL에 반영 — 새로고침·공유 가능.

```typescript
// app/(dashboard)/books/page.tsx
const [query, setQuery] = useQueryState('q', { defaultValue: '' });
const [page, setPage] = useQueryState('page', { defaultValue: 1, parse: Number });
```

## 환경 변수

`.env*` 우선순위는 글로벌 `~/.claude/rules/tooling.md` §4 정책을 따름.

- 필수 변수:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)
  - `ANTHROPIC_API_KEY` (서버 전용)
- 옵션:
  - `NAVER_BOOK_CLIENT_ID`, `NAVER_BOOK_CLIENT_SECRET` (책 검색)
- 파일:
  - `.env.local` — 본인 로컬 (git 제외)
  - `.env.local.example` — 키 목록 (값 없음, git 추적)
  - Vercel 대시보드에 프로덕션 변수 등록

## 배포 (Vercel)

- main 브랜치 push 시 자동 배포
- Preview 배포로 PR 검토
- Edge Runtime 활용 가능 (단, Supabase·Claude SDK 호환 확인)
