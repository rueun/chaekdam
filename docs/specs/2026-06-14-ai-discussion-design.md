# 설계: AI 독서토론 도메인

작성일: 2026-06-14 · 상태: 승인 · 근거: ADR-005·007·008·009·015, `ddd.md`, `ARCHITECTURE.md` §도메인 모델

## 목적

책+페르소나로 AI와 독서 토론을 나누는 기능을 Clean Architecture로 구현한다.
UI(목록·채팅·새 대화 모달·페르소나 카드)는 더미로 완성돼 있고, 도메인·애플리케이션·
인프라 계층과 실연동이 미구현이다.

## 확정 결정 (브레인스토밍)

1. **비스트리밍 먼저** — `AiDiscussionPartner.respond()`는 완성 텍스트 반환. 스트리밍은 같은 Port를
   async iterable로 확장하는 후속 슬라이스.
2. **페르소나 = 코드 상수** — 4 아키타입의 톤·시스템 프롬프트를 `lib/domain/persona`에 코드로.
   `personas` 테이블·`PersonaRepository` 없음(정적 도메인 지식). → ADR-015.
3. **작가 본인 페르소나 보류** — MVP는 소크라테스/비평가/책동무 3종. author는 정의만 두고
   `availableKeys()`에서 제외. Author 도메인·저작권 판정은 후속.
4. **Discussion anchor = 책+페르소나, 한 줄은 선택 시드** — 방은 책+페르소나로 생성(새 대화 모달과
   일치), `seedHighlightId`는 첫 턴을 여는 선택 컨텍스트.

## 도메인 모델 (`lib/domain/`)

### persona/persona.ts (코드 상수)

- `type PersonaKey = 'socrates' | 'critic' | 'author' | 'friend'` — 도메인이 정본.
- `class Persona` (불변): `key`, `name`, `tone`(시스템 프롬프트용 페르소나 지침), `requiresDeceasedAuthor`.
- 정적 레지스트리: `Persona.of(key)`, `Persona.availableKeys()` → `['socrates','critic','friend']`,
  `Persona.isAvailable(key)`.

### discussion/role.ts

- `Role` VO: `USER` / `AI`. (`BookStatus`/`NoteSource` 패턴)

### discussion/message.ts

- `Message` 엔티티(불변): `id`, `discussionId`, `role`, `content`, `createdAt`.
- 팩토리: `fromUser(discussionId, content)`, `fromAi(discussionId, content)`, `restore(...)`.
- 불변식: content 비어있지 않음·길이 상한.

### discussion/discussion.ts (Aggregate Root)

- 필드(불변): `id`, `bookId`, `personaKey`, `seedHighlightId: string | null`, `title: string | null`,
  `messages: readonly Message[]`, `createdAt`.
- `Discussion.start({ bookId, personaKey, seedHighlightId?, title? })` — 빈 방 생성.
  persona가 `Persona.isAvailable`이 아니면 `PersonaNotAvailableError`.
- `withMessage(message): Discussion` — 메시지 추가한 새 인스턴스(불변).
- 페르소나는 생성 후 불변(전이 메서드 없음). 다른 Aggregate(Book/Highlight)는 ID로만 참조.

## Ports & UseCases

### Ports

- `DiscussionRepository`: `save(discussion)`, `findById(id): Promise<Discussion | null>`(메시지 포함),
  `findAll(): Promise<Discussion[]>`(목록; MVP는 메시지 포함, 후속에 summary 투영).
- `AiDiscussionPartner`: `respond(context): Promise<string>`.
  - `DiscussionContext = { persona: Persona; book: { title; author }; seedHighlight: string | null;
history: { role: Role; content: string }[] }`.
  - history 비면 첫 발화(여는 말), 있으면 후속 응답. 단일 메서드.

### UseCases (각 1파일, Port 주입)

- `start-discussion.use-case.ts`: 입력 `{ bookId, personaKey, seedHighlightId? }` →
  `Discussion.start` → 책 메타·시드 조회 → `respond`(history 빈) → 첫 AI `Message` 추가 → 저장 →
  Discussion 반환. **시작 시 첫 AI 응답 포함**(testing.md 케이스).
- `continue-discussion.use-case.ts`: 입력 `{ discussionId, content }` → 방 로드 → 사용자 메시지 추가 →
  `respond`(history 포함) → AI 메시지 추가 → 저장.
- 의존: `DiscussionRepository`, `AiDiscussionPartner`, `BookRepository`(메타), `HighlightRepository`(시드).

## 데이터 모델 (마이그레이션)

```sql
create table discussions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  persona_key text not null check (persona_key in ('socrates','critic','author','friend')),
  seed_highlight_id uuid references highlights(id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  discussion_id uuid not null references discussions(id) on delete cascade,
  role text not null check (role in ('USER','AI')),
  content text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);
-- 인덱스: discussions(user_id, created_at desc), messages(discussion_id, created_at)
-- RLS 4정책(본인만) on 두 테이블. messages.user_id 비정규화로 단순 RLS(기존 패턴 일치).
```

- persona_key는 DB엔 4종 허용(미래 대비). author 거부는 도메인/유스케이스.
- seed_highlight_id `on delete set null` — 시드 한 줄 삭제돼도 방은 유지.

## AI 어댑터 (`lib/infrastructure/claude/claude-ai-discussion-partner.ts`)

- `@anthropic-ai/sdk`, **server-only**, SDK는 이 파일에만 격리(ADR-005, LLM 교체 대비).
- 시스템 프롬프트 = 공통 지침(한국어·5~10턴 깊이·캐릭터 유지) + 페르소나 `tone` + 책 메타(제목·저자).
  책 메타/시스템 블록에 **프롬프트 캐싱**(`cache_control`).
- history → messages 변환. 여는 말(history 빈)은 합성 user 턴(시드 한 줄 또는 "대화를 열어줘") 주입.
- 비스트리밍 `messages.create`, 모델 상수(`claude-sonnet-4-6`), 에러 래핑(영문 메시지).

## 권한

- 소유권은 **RLS**로 보장(Book/Highlight/ReadingSession과 동일, 아직 도메인 Spec 미도입).
  `CanReadDiscussionSpec`은 백엔드 분리 시 추가 여지로만 둔다.

## 테스트

- 도메인 단위: Persona/Role/Message/Discussion(불변성·팩토리·불변식·`PersonaNotAvailableError`).
- 유스케이스: `FakeAiDiscussionPartner` + `InMemoryDiscussionRepository` + 기존 InMemory Book/Highlight로
  Start/Continue 검증(Mock 금지, Fake). "시작 시 첫 AI 응답 포함" 등.
- 통합: `SupabaseDiscussionRepository`(RLS·FK·cascade·check) 실 Supabase.
- Claude 어댑터: 실 API 통합테스트 안 함(비용·비결정성). Fake로 유스케이스 검증, 실 어댑터는 수동 확인.

## 슬라이스 계획 (각 커밋, `/review` 후)

1. 도메인(Persona/Role/Message/Discussion) + 단위테스트.
2. `StartDiscussion`/`ContinueDiscussion` + `FakeAiDiscussionPartner` + 유스케이스 테스트.
3. 마이그레이션 + `SupabaseDiscussionRepository` + 통합테스트 + di-container.
4. `ClaudeAiDiscussionPartner` + 프롬프트 + di-container.
5. UI 실연동(목록·`[id]`·채팅·새 대화 모달) — 비스트리밍, 더미 제거.

## 비범위 (후속)

- 스트리밍 응답, 작가 본인 페르소나 + Author 도메인/저작권 판정, 리치 책 메타(장르·요약·저자스타일),
  다중 사용자(Participant 활성화), 목록 summary 투영 최적화, `DiscussionCompleted`/자동 토론 시작.
