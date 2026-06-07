# 책담 아키텍처

이 문서는 **아키텍처 결정과 구조**를 기록합니다. 코드 레벨 규칙은 [`../.claude/rules/`](../.claude/rules/) 와 글로벌 `~/.claude/rules/`를 따릅니다.

---

## 1. 개요

**책담**은 Next.js + Supabase + Claude API 기반의 AI 독서 토론 웹 / 앱입니다. 사용자가 책의 인상 깊은 페이지를 사진 / 텍스트로 캡처해 "한 줄"로 담으면, 선택한 페르소나의 Claude가 그 내용을 기반으로 1:1 깊이 있는 토론을 진행합니다. 담은 한 줄과 독서 기록(책장 상태·세션·캘린더)은 본인의 독서 자산으로 누적됩니다. UI 는 단일 라이트(페이퍼) 테마 · 딥 포레스트 그린 단일 포인트색입니다.

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
- `components/feature/`: **기능별로 응집** (`book-search/`, `highlight-capture/`, `discussion-chat/`, `reading-log/`, `library/`, `share/`)

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
│   │   │   ├── book.ts                     # Entity (author 는 현재 string — 아래 참고)
│   │   │   └── book-status.ts              # VO (READING | DONE | WISH | PAUSED)
│   │   │   # author.ts(Author Entity: 생몰년·저작권 만료)는 페르소나 슬라이스에서 도입.
│   │   │   # 그 전까지 Book.author 는 표시용 string.
│   │   ├── highlight/                       # "한 줄" — 캡처한 구절
│   │   │   ├── highlight.ts                # Entity
│   │   │   └── note-source.ts              # VO (PHOTO | TEXT)
│   │   ├── reading-log/                     # 독서 기록 (저널링 실현 — ADR-010/012)
│   │   │   ├── reading-session.ts          # Entity ('분' = 리더 화면 체류 시간)
│   │   │   └── reading-log.ts              # Entity (일자별 읽음·연속일·통계)
│   │   ├── discussion/
│   │   │   ├── discussion.ts               # Aggregate Root (책당 다중 방·페르소나 고정)
│   │   │   ├── message.ts                  # Entity
│   │   │   ├── role.ts                     # VO (USER | AI)
│   │   │   └── specs/
│   │   │       └── can-read-discussion.spec.ts
│   │   ├── persona/
│   │   │   └── persona.ts                  # Entity (4 아키타입, 작가 본인=사망 작가 한정)
│   │   ├── user/
│   │   │   └── user.ts
│   │   ├── shared/
│   │   │   └── errors.ts                   # 도메인 예외
│   │   └── ports/                          # 인터페이스만
│   │       ├── book-searcher.ts
│   │       ├── book-repository.ts
│   │       ├── highlight-repository.ts
│   │       ├── reading-log-repository.ts
│   │       ├── discussion-repository.ts
│   │       ├── persona-repository.ts
│   │       ├── ai-discussion-partner.ts    # Claude 추상화
│   │       ├── highlight-image-renderer.ts # "한 장 이미지로 만들기" (공유)
│   │       ├── photo-storage.ts
│   │       └── auth-session.ts
│   │
│   ├── application/                        # 유스케이스
│   │   ├── search-books.use-case.ts
│   │   ├── capture-highlight.use-case.ts
│   │   ├── list-highlights.use-case.ts
│   │   ├── set-book-status.use-case.ts     # 책장 이동 (읽는 중/완독/위시/쉬는 중)
│   │   ├── log-reading-session.use-case.ts
│   │   ├── start-discussion.use-case.ts
│   │   └── continue-discussion.use-case.ts
│   │
│   └── infrastructure/                     # Adapter
│       ├── supabase/
│       │   ├── supabase-book-repository.ts
│       │   ├── supabase-highlight-repository.ts
│       │   ├── supabase-reading-log-repository.ts
│       │   ├── supabase-discussion-repository.ts
│       │   ├── supabase-persona-repository.ts
│       │   ├── supabase-photo-storage.ts
│       │   ├── supabase-auth-session.ts
│       │   └── types.gen.ts                # 자동 생성
│       ├── claude/
│       │   └── claude-ai-discussion-partner.ts
│       ├── naver-books/
│       │   └── naver-book-searcher.ts
│       ├── share/
│       │   └── canvas-highlight-image-renderer.ts
│       └── di-container.ts                 # 의존성 주입 조립
│
├── components/                             # 재사용 UI 컴포넌트 (FSD 'feature' 슬라이싱 차용)
│   ├── ui/                                 # 재사용 primitives (shadcn 등 디자인 시스템)
│   └── feature/                            # 기능별 응집 컴포넌트
│       ├── book-search/                    # 책 검색 UI 묶음
│       ├── highlight-capture/              # 사진 / 텍스트 한 줄 입력 UI
│       ├── discussion-chat/                # AI 토론 채팅 UI
│       ├── reading-log/                    # 캘린더·연속일·통계 UI
│       ├── library/                        # 서재·책장 상태·위시리스트 UI
│       └── share/                          # 한 줄 / 책 공유 시트
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

> 기획 결정 완료 (자세한 결정 사항·근거: [`ADR.md`](./ADR.md) ADR-007 ~ ADR-013 참조).
>
> 토론 모드 = **하이브리드** (책 메타 + 한 줄) / 사용자 수 = **1:1 (다중 확장 가능 구조)** / AI 페르소나 = **톤·관점 아키타입 4종** (작가 본인=사망 작가 한정) / 핵심 가치 = **정서·자기 표현(메인) + 저널링(보조)** — 저널링은 별도 회고 노트가 아니라 **한 줄 + 독서 기록**으로 실현 / 테마 = **단일 라이트(페이퍼)** / 공유 = **외부 내보내기만, 인앱 피드 제외**

### 핵심 엔티티

| 이름             | 종류           | 책임                                                                                                                    |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `User`           | Entity         | 사용자 식별·기본 프로필                                                                                                 |
| `Participant`    | Entity         | 토론 참가자 (User 또는 AI Persona 참조). **다중 사용자 확장 대비** (ADR-008)                                            |
| `Book`           | Entity         | 책 메타데이터 (제목·저자·장르·간단 요약·저자 스타일) — 하이브리드 모드용                                                |
| `BookStatus`     | VO             | `READING` / `DONE` / `WISH` / `PAUSED` — 책장(shelf) 상태. 위시리스트 = `WISH`                                          |
| `Author`         | Entity         | 작가 정보 (이름·소개·생몰년·저작권 만료 여부). **작가 본인 페르소나 활성 판정에 사용**                                  |
| `Persona`        | Entity         | AI 페르소나 — 4 아키타입 (소크라테스/비평가/작가 본인/책 동무). 시스템 프롬프트 보유. 작가 본인은 사망 작가에 한해 활성 |
| `Highlight`      | Entity         | "한 줄" — 캡처한 인상 깊은 구절 (사진 또는 텍스트). 저널링의 핵심 단위                                                  |
| `NoteSource`     | VO             | `PHOTO` / `TEXT`                                                                                                        |
| `ReadingSession` | Entity         | 한 번의 읽기 세션 — `분`(리더 화면 체류 시간)·페이지 범위. 책별 누적                                                    |
| `ReadingLog`     | Entity         | 일자별 읽음 여부·연속일(streak)·장르/작가 통계 집계                                                                     |
| `Discussion`     | Aggregate Root | 책 + 한 줄 + 페르소나 + 참가자 묶음 토론 방. 책당 여러 방, 생성 후 페르소나 고정                                        |
| `Message`        | Entity         | 토론 내 발화                                                                                                            |
| `Role`           | VO             | `USER` / `AI`                                                                                                           |

### Aggregate 경계

- **`Discussion`**: 트랜잭션 단위. 메시지 추가·완료·재시작·참가자 추가가 한 Aggregate 내. Persona / Book / Highlight 는 ID 참조. 한 책에 여러 Discussion(방), 생성 시 Persona 고정(불변).
- **`Highlight`**: 독립 Aggregate. Discussion 은 Highlight ID 참조로만 연결. 저널링·밑줄 모음의 단위.
- **`ReadingLog` / `ReadingSession`**: 독립 Aggregate. 책·사용자 ID 참조. 세션이 쌓여 로그·연속일·통계로 집계.
- **`Book`**: 외부 데이터 캐시 + `BookStatus`(책장 상태). 단순.
- **`Persona`**: 시스템에서 큐레이션 / 제공. 사용자가 만들지 않음.

### Port (도메인이 정의)

| Port                     | 역할                                                 | 주요 Adapter                   |
| ------------------------ | ---------------------------------------------------- | ------------------------------ |
| `BookSearcher`           | 외부 API 에서 책 검색 (네이버 책)                    | `NaverBookSearcher`            |
| `BookRepository`         | 책 메타·책장 상태(BookStatus) 저장·조회              | `SupabaseBookRepository`       |
| `HighlightRepository`    | 한 줄 저장·조회·목록                                 | `SupabaseHighlightRepository`  |
| `ReadingLogRepository`   | 세션·일자별 기록·연속일·통계 저장·조회               | `SupabaseReadingLogRepository` |
| `DiscussionRepository`   | 토론·메시지·참가자 저장·조회                         | `SupabaseDiscussionRepository` |
| `PersonaRepository`      | 페르소나 목록·시스템 프롬프트 조회 (큐레이션 데이터) | `SupabasePersonaRepository`    |
| `AiDiscussionPartner`    | AI 응답 생성 (Persona 시스템 프롬프트 포함)          | `ClaudeAiDiscussionPartner`    |
| `HighlightImageRenderer` | 한 줄을 한 장 이미지로 렌더 (공유용)                 | `CanvasHighlightImageRenderer` |
| `PhotoStorage`           | 사진 업로드·URL 발급                                 | `SupabasePhotoStorage`         |
| `AuthSession`            | 현재 사용자 ID 조회                                  | `SupabaseAuthSession`          |

### 도메인 이벤트 (후보)

- `HighlightCaptured` — 한 줄 캡처 시
- `DiscussionStarted` — 토론 시작 시 (Persona·Book·Highlight 정보 포함)
- `MessageAdded` — 메시지 추가 시
- `DiscussionCompleted` — 토론 종료 시
- `ReadingSessionLogged` — 읽기 세션 종료 시 ('분'·페이지 누적 → 연속일·통계 갱신)
- `BookStatusChanged` — 책장 이동 시 (위시 → 읽는 중, 읽는 중 → 완독 등)

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

| 항목            | 결정                                                                                 | 관련 ADR |
| --------------- | ------------------------------------------------------------------------------------ | -------- |
| **토론 모드**   | 하이브리드 (책 메타 + 사용자 한 줄)                                                  | ADR-007  |
| **사용자 수**   | 1:1 (다중 사용자 확장 가능 구조 — Participant 분리)                                  | ADR-008  |
| **AI 페르소나** | 톤·관점 아키타입 4종 (소크라테스/비평가/작가 본인/책 동무). 작가 본인=사망 작가 한정 | ADR-009  |
| **핵심 가치**   | 정서·자기 표현 (메인) + 저널링 (보조) — 한 줄 + 독서 기록으로 실현                   | ADR-010  |
| **테마·브랜드** | 단일 라이트(페이퍼) 테마 + 딥 포레스트 그린 단일 포인트 (다크 모드 제외)             | ADR-011  |
| **독서 추적**   | 책장 상태·세션·독서 기록 도메인 (BookStatus·ReadingSession·ReadingLog)               | ADR-012  |
| **공유**        | 외부 내보내기(링크·이미지·SNS) 포함, 인앱 소셜 피드 제외                             | ADR-013  |

→ 자세한 근거·트레이드오프: [`ADR.md`](./ADR.md). 제품 측면 정의: [`PRD.md`](./PRD.md).

---

## 8. 참고

- 글로벌 규칙: `~/.claude/rules/architecture.md`, `ddd.md`, `design-patterns.md`
- 프로젝트 규칙: `.claude/rules/stack.md`, `.claude/rules/testing.md`
- 검증 도구: `/arch-check`, `/domain-check`, `/arch-review` 슬래시 명령어
