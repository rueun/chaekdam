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

## 5. 도메인 모델

> 기획 4가지 결정 완료 (자세한 결정 사항·근거: [`ADR.md`](./ADR.md) ADR-007 ~ ADR-010 참조).
>
> 토론 모드 = **하이브리드** (책 메타 + 구절) / 사용자 수 = **1:1 (다중 확장 가능 구조)** / AI 페르소나 = **선택형 + 사망 작가** / 핵심 가치 = **정서·자기 표현(메인) + 회고·저널링(보조)**

### 핵심 엔티티

| 이름          | 종류           | 책임                                                                             |
| ------------- | -------------- | -------------------------------------------------------------------------------- |
| `User`        | Entity         | 사용자 식별·기본 프로필                                                          |
| `Participant` | Entity         | 토론 참가자 (User 또는 AI Persona 참조). **다중 사용자 확장 대비** (ADR-008)     |
| `Book`        | Entity         | 책 메타데이터 (제목·저자·장르·간단 요약·저자 스타일) — 하이브리드 모드용         |
| `Author`      | Entity         | 작가 정보 (이름·소개·생몰년·저작권 만료 여부)                                    |
| `Persona`     | Entity         | AI 페르소나 (일반: 학구파/캐주얼/비평가, 작가: 사망 작가) — 시스템 프롬프트 보유 |
| `ReadingNote` | Entity         | 인상 깊은 구절 (사진 또는 텍스트)                                                |
| `NoteSource`  | VO             | `PHOTO` / `TEXT`                                                                 |
| `Discussion`  | Aggregate Root | 책 + 노트 + 페르소나 + 참가자 묶음 토론 세션                                     |
| `Message`     | Entity         | 토론 내 발화                                                                     |
| `Role`        | VO             | `USER` / `AI`                                                                    |
| `Reflection`  | Entity         | 토론 종료 후 본인 회고 노트 (저널링 — ADR-010)                                   |

### Aggregate 경계

- **`Discussion`**: 트랜잭션 단위. 메시지 추가·완료·재시작·참가자 추가가 한 Aggregate 내. Persona / Book / ReadingNote 는 ID 참조.
- **`Reflection`**: 독립 Aggregate. Discussion 종료 후 사용자가 별도로 작성. Discussion ID 참조로만 연결.
- **`ReadingNote`**: 독립 Aggregate. Discussion 은 Note ID 참조로만 연결.
- **`Book`**: 외부 데이터 캐시. 단순.
- **`Persona`**: 시스템에서 큐레이션 / 제공. 사용자가 만들지 않음.

### Port (도메인이 정의)

| Port                    | 역할                                                 | 주요 Adapter                    |
| ----------------------- | ---------------------------------------------------- | ------------------------------- |
| `BookSearcher`          | 외부 API 에서 책 검색                                | `NaverBookSearcher`             |
| `BookRepository`        | 책 메타데이터 캐시 저장·조회                         | `SupabaseBookRepository`        |
| `ReadingNoteRepository` | 노트 저장·조회                                       | `SupabaseReadingNoteRepository` |
| `DiscussionRepository`  | 토론·메시지·참가자 저장·조회                         | `SupabaseDiscussionRepository`  |
| `ReflectionRepository`  | 회고 노트 저장·조회                                  | `SupabaseReflectionRepository`  |
| `PersonaRepository`     | 페르소나 목록·시스템 프롬프트 조회 (큐레이션 데이터) | `SupabasePersonaRepository`     |
| `AiDiscussionPartner`   | AI 응답 생성 (Persona 시스템 프롬프트 포함)          | `ClaudeAiDiscussionPartner`     |
| `PhotoStorage`          | 사진 업로드·URL 발급                                 | `SupabasePhotoStorage`          |
| `AuthSession`           | 현재 사용자 ID 조회                                  | `SupabaseAuthSession`           |

### 도메인 이벤트 (후보)

- `DiscussionStarted` — 토론 시작 시 (Persona·Book·Note 정보 포함)
- `MessageAdded` — 메시지 추가 시
- `DiscussionCompleted` — 토론 종료 시 (회고 작성 유도 트리거)
- `ReflectionWritten` — 회고 작성 완료 시 (재방문 통계·추천)
- `ReadingNoteCaptured` — 노트 추가 시

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

## 7. 기획 결정 사항 (확정)

| 항목            | 결정                                                | 관련 ADR |
| --------------- | --------------------------------------------------- | -------- |
| **토론 모드**   | 하이브리드 (책 메타 + 사용자 구절)                  | ADR-007  |
| **사용자 수**   | 1:1 (다중 사용자 확장 가능 구조 — Participant 분리) | ADR-008  |
| **AI 페르소나** | 선택형 + 사망 작가 (생존 작가 영구 금지)            | ADR-009  |
| **핵심 가치**   | 정서·자기 표현 (메인) + 회고·저널링 (보조)          | ADR-010  |

→ 자세한 근거·트레이드오프: [`ADR.md`](./ADR.md). 제품 측면 정의: [`PRD.md`](./PRD.md).

---

## 8. 참고

- 글로벌 규칙: `~/.claude/rules/architecture.md`, `ddd.md`, `design-patterns.md`
- 프로젝트 규칙: `.claude/rules/stack.md`, `.claude/rules/testing.md`
- 검증 도구: `/arch-check`, `/domain-check`, `/arch-review` 슬래시 명령어
