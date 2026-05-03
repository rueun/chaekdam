# 책담 아키텍처

이 문서는 **아키텍처 결정과 구조**를 기록합니다. 코드 레벨 규칙은 [`../.claude/rules/`](../.claude/rules/) 와 글로벌 `~/.claude/rules/`를 따릅니다.

---

## 1. 개요

**책담**은 Next.js + Supabase + Claude API 기반의 AI 독서 토론 웹 / 앱입니다. 사용자가 책의 인상 깊은 페이지를 사진 / 텍스트로 캡처하면, Claude가 그 내용을 기반으로 1:1 깊이 있는 토론을 진행합니다.

핵심 설계 목표:

- **빠른 MVP** — Vercel + Supabase 무료 티어로 검증
- **언제든 별도 백엔드(Nest 등)로 이전 가능한 구조** — 도메인 / 유스케이스가 프레임워크에 의존하지 않음
- **AI 통합 친화적** — Claude API의 vision · 스트리밍 · 프롬프트 캐싱을 자연스럽게 활용

---

## 2. 아키텍처 결정 (ADR)

### ADR-001: Next.js + Supabase로 시작 (별도 백엔드 없음)

**컨텍스트**: 1인 / MVP 단계. 비즈니스 로직 복잡도는 중간. 모바일 앱은 추후 확장.

**결정**:

- Next.js (App Router)에 Server Actions로 백엔드 코드를 둠
- Supabase가 Auth · DB · Storage · 권한(RLS) 담당
- Claude API는 Server Action 내부에서 호출 (API 키 서버 측 보호)

**트레이드오프**:

- ✅ 풀스택 통합·빠른 MVP·인프라 관리 거의 없음
- ⚠️ 복잡한 도메인 로직이 늘면 Server Action에 뭉치기 쉬움 → ADR-002로 보완
- ⚠️ Supabase RLS는 백엔드 분리 시 이전 비용 있음 → ADR-004로 대비

### ADR-002: Clean Architecture + Domain First

**컨텍스트**: ADR-001의 한계 보완 + 추후 백엔드 분리 가능성.

**결정**:

- 4계층 분리: Domain / Application / Infrastructure / Presentation
- 의존성 방향: 내부(Domain)는 외부(Service / Infra / Presentation)를 모름
- 개발 순서: 도메인 → Port → Application → Infrastructure → Presentation

### ADR-003: `lib/domain/`은 외부 의존 0

**컨텍스트**: 도메인 코드가 프레임워크 / BaaS에 의존하면 백엔드 분리 시 코드 손실.

**결정**: `lib/domain/`에서 다음 import 금지

- `next/*`, `next/server`
- `@supabase/*`
- `@anthropic-ai/sdk`
- `react`, `react-dom`
- ORM 클라이언트 (`prisma`, `typeorm` 등)

**검증**: `architecture-guard` 서브 에이전트 자동 검사 (`/arch-check`)

### ADR-004: RLS + 도메인 Specification 이중 방어

**컨텍스트**: Supabase RLS는 SQL 기반이라 별도 백엔드로 옮기면 그대로 못 씀.

**결정**: 권한 검증을 **두 곳**에서 표현

1. Supabase RLS 정책 (현재 1차 방어)
2. 도메인 Specification 객체 — `lib/domain/**/specs/`

→ 백엔드 분리 시 RLS만 제거, 도메인 스펙은 그대로 사용.

```typescript
// lib/domain/discussion/specs/can-read-discussion.spec.ts
export class CanReadDiscussionSpec {
  isSatisfiedBy(user: User, discussion: Discussion): boolean {
    return discussion.ownerId === user.id;
  }
}
```

### ADR-005: AI 호출은 Port로 추상화

**컨텍스트**: Claude API에 도메인이 직접 의존하면 다른 LLM(GPT, Gemini 등)으로 교체 어려움.

**결정**: 도메인은 `AiDiscussionPartner` Port에만 의존. `ClaudeAiDiscussionPartner` Adapter가 Anthropic SDK 실호출.

### ADR-006: 컴포넌트 디렉토리에 FSD 'feature' 슬라이싱 차용

**컨텍스트**: 회사 코드(`copykiller-front-scaffold`)는 FSD(Feature-Sliced Design)로 **수직 분리** (pages / features / entities / shared). 책담은 Clean Architecture로 **수평 분리** (domain / application / infrastructure / presentation). 두 패러다임을 그대로 섞으면 혼란.

**결정**: 도메인·유스케이스는 Clean Arch 그대로 (수평 분리 유지). **UI 컴포넌트만 기능별 응집**(수직 슬라이싱) 차용.

- `lib/domain/`, `lib/application/`, `lib/infrastructure/`: 수평 분리 유지 → 백엔드 분리 가능성 보존
- `components/ui/`: 재사용 primitives (shadcn 등 디자인 시스템)
- `components/feature/`: **기능별로 응집** (`book-search/`, `note-capture/`, `discussion-chat/`)

**이유**: 도메인 로직은 백엔드 분리 가능성을 위해 수평 분리. UI는 단일 화면이 여러 도메인 데이터를 조합하고 기능 추가가 잦으므로 기능별 응집이 가독성·이동성에 유리.

---

## 3. 의존성 규칙

```
Presentation (Next.js: app/, components/)
       │
       ▼
Application (lib/application/)
       │
       ▼
Domain (lib/domain/)            ◄────── Infrastructure (lib/infrastructure/)
       ▲                                       │
       └─────── Port (interface) ──────────────┘
```

핵심 규칙:

- **내부 계층은 외부 계층을 모른다**
- **DIP**: Infrastructure가 Domain의 Port를 구현
- **프레임워크 독립**: Domain은 표준 라이브러리만 사용

---

## 4. 디렉토리 구조

```
chaekdam/
├── app/                                    # Presentation (Next.js)
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── books/
│   │   ├── notes/
│   │   └── discussions/
│   │       ├── [id]/page.tsx
│   │       └── actions.ts                  # Server Actions (얇은 래퍼)
│   ├── api/
│   │   └── webhook/route.ts                # 외부 webhook 한정
│   └── layout.tsx
│
├── lib/
│   ├── domain/                             # ⭐ 외부 의존 0
│   │   ├── book/
│   │   │   ├── book.ts                     # Entity
│   │   │   └── author.ts                   # VO
│   │   ├── reading-note/
│   │   │   ├── reading-note.ts             # Entity
│   │   │   └── note-source.ts              # VO (PHOTO | TEXT)
│   │   ├── discussion/
│   │   │   ├── discussion.ts               # Aggregate Root
│   │   │   ├── message.ts                  # Entity
│   │   │   ├── role.ts                     # VO (USER | AI)
│   │   │   └── specs/
│   │   │       └── can-read-discussion.spec.ts
│   │   ├── user/
│   │   │   └── user.ts
│   │   ├── shared/
│   │   │   └── errors.ts                   # 도메인 예외
│   │   └── ports/                          # 인터페이스만
│   │       ├── book-searcher.ts
│   │       ├── book-repository.ts
│   │       ├── reading-note-repository.ts
│   │       ├── discussion-repository.ts
│   │       ├── ai-discussion-partner.ts    # Claude 추상화
│   │       ├── photo-storage.ts
│   │       └── auth-session.ts
│   │
│   ├── application/                        # 유스케이스
│   │   ├── search-books.use-case.ts
│   │   ├── add-reading-note.use-case.ts
│   │   ├── start-discussion.use-case.ts
│   │   └── continue-discussion.use-case.ts
│   │
│   └── infrastructure/                     # Adapter
│       ├── supabase/
│       │   ├── supabase-book-repository.ts
│       │   ├── supabase-reading-note-repository.ts
│       │   ├── supabase-discussion-repository.ts
│       │   ├── supabase-photo-storage.ts
│       │   ├── supabase-auth-session.ts
│       │   └── types.gen.ts                # 자동 생성
│       ├── claude/
│       │   └── claude-ai-discussion-partner.ts
│       ├── naver-books/                    # 또는 google-books/
│       │   └── naver-book-searcher.ts
│       └── di-container.ts                 # 의존성 주입 조립
│
├── components/                             # 재사용 UI 컴포넌트 (FSD 'feature' 슬라이싱 차용)
│   ├── ui/                                 # 재사용 primitives (shadcn 등 디자인 시스템)
│   └── feature/                            # 기능별 응집 컴포넌트
│       ├── book-search/                    # 책 검색 UI 묶음
│       ├── note-capture/                   # 사진 / 텍스트 노트 입력 UI
│       └── discussion-chat/                # AI 토론 채팅 UI
│
├── supabase/                               # 마이그레이션·RLS
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── docs/                                   # 아키텍처·결정 기록 (이 폴더)
├── tests/                                  # E2E 테스트 (Playwright)
└── .claude/                                # Claude Code 프로젝트 규칙
    └── rules/
```

---

## 5. 도메인 모델 (잠정)

> ⚠️ 기획 4가지(토론 모드 / 사용자 수 / AI 페르소나 / 핵심 가치) 미확정. 아래는 **기본값 가정 모델**이며, 결정 후 갱신.
>
> 가정: 구절 한정 토론 / 1:1 / 고정 페르소나 / 정서·자기 표현 가치

### 핵심 엔티티

| 이름          | 종류           | 책임                              |
| ------------- | -------------- | --------------------------------- |
| `User`        | Entity         | 사용자 식별·기본 프로필           |
| `Book`        | Entity         | 책 메타데이터 (제목·저자·표지 등) |
| `Author`      | VO             | 작가 정보 (이름·소개)             |
| `ReadingNote` | Entity         | 인상 깊은 구절 (사진 또는 텍스트) |
| `NoteSource`  | VO             | `PHOTO` / `TEXT`                  |
| `Discussion`  | Aggregate Root | 책 + 노트 묶음에 대한 토론 세션   |
| `Message`     | Entity         | 토론 내 발화 (User / AI)          |
| `Role`        | VO             | `USER` / `AI`                     |

### Aggregate 경계

- **`Discussion`**: 트랜잭션 단위. 메시지 추가·완료·재시작이 한 Aggregate 내에서.
- **`ReadingNote`**: 독립 Aggregate. Discussion은 Note ID 참조로만 연결.
- **`Book`**: 외부 데이터 캐시. 단순.

### Port (도메인이 정의)

| Port                    | 역할                         | 주요 Adapter                    |
| ----------------------- | ---------------------------- | ------------------------------- |
| `BookSearcher`          | 외부 API에서 책 검색         | `NaverBookSearcher`             |
| `BookRepository`        | 책 메타데이터 캐시 저장·조회 | `SupabaseBookRepository`        |
| `ReadingNoteRepository` | 노트 저장·조회               | `SupabaseReadingNoteRepository` |
| `DiscussionRepository`  | 토론·메시지 저장·조회        | `SupabaseDiscussionRepository`  |
| `AiDiscussionPartner`   | AI 응답 생성                 | `ClaudeAiDiscussionPartner`     |
| `PhotoStorage`          | 사진 업로드·URL 발급         | `SupabasePhotoStorage`          |
| `AuthSession`           | 현재 사용자 ID 조회          | `SupabaseAuthSession`           |

### 도메인 이벤트 (후보)

- `DiscussionStarted` — 토론 시작 시
- `MessageAdded` — 메시지 추가 시
- `ReadingNoteCaptured` — 노트 추가 시 (통계·추천에 활용 가능)

---

## 6. A → B 전환 매트릭스

A = 현재 구조 (Next.js + Supabase)
B = 별도 백엔드 (예: NestJS) + Next.js 프론트

| 영역                           | A (현재)            | B (전환 후)                       | 전환 비용               |
| ------------------------------ | ------------------- | --------------------------------- | ----------------------- |
| `lib/domain/`                  | 그대로              | Nest `src/domain/` 으로 **복사**  | **0**                   |
| `lib/application/`             | 그대로              | Nest `Service`로 **복사**         | **0**                   |
| `lib/infrastructure/supabase/` | Supabase Adapter    | TypeORM·Prisma Adapter로 **교체** | 중                      |
| `lib/infrastructure/claude/`   | 그대로              | 위치만 이동                       | 소                      |
| 진입점                         | Server Actions      | Nest `Controller`                 | 소                      |
| 인증                           | Supabase Auth       | JWT / OAuth 직접 구현             | 중                      |
| DB 스키마                      | Supabase migrations | TypeORM 매핑 또는 그대로          | 소                      |
| **권한 검증 (RLS)**            | DB 정책             | 백엔드 도메인 Spec으로 이전       | **대** (ADR-004로 완화) |
| 모바일 앱                      | PWA 또는 Expo       | 동일 백엔드 호출                  | —                       |

---

## 7. 미결정 사항 (기획 확정 시 갱신)

다음 4가지가 결정되면 도메인 모델·UX·프롬프트가 확정됩니다.

| 항목            | 옵션                                  | 영향                                                      |
| --------------- | ------------------------------------- | --------------------------------------------------------- |
| **토론 모드**   | 구절 한정 / 책 전체 맥락 / 하이브리드 | 시스템 프롬프트, 비용 구조                                |
| **사용자 수**   | 1:1 / 북클럽 (다중)                   | 도메인 모델 (Participant 엔티티 필요 여부), 실시간 인프라 |
| **AI 페르소나** | 고정 1개 / 선택형                     | Persona 엔티티·UX                                         |
| **핵심 가치**   | 정서 / 학습 / 저널링                  | 모든 UX·프롬프트의 톤                                     |

→ 결정되면 **이 문서 §5 도메인 모델 섹션**과 §2 ADR을 업데이트.

---

## 8. 참고

- 글로벌 규칙: `~/.claude/rules/architecture.md`, `ddd.md`, `design-patterns.md`
- 프로젝트 규칙: `.claude/rules/stack.md`, `.claude/rules/testing.md`
- 검증 도구: `/arch-check`, `/domain-check`, `/arch-review` 슬래시 명령어
