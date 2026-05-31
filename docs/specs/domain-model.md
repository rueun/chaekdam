# 도메인 모델

> [`../ARCHITECTURE.md` §5](../ARCHITECTURE.md) 의 엔티티 개요 표를 풀어쓴 **세부 명세**.
> 각 엔티티의 **필드·정적 팩토리·도메인 메소드·불변 규칙·관계**를 정의한다.
> 구현(`lib/domain/`)의 직접 가이드.

---

## 0. 도메인 맵

```
[User] 1 ─── N [Participant] N ─── 1 [Discussion] ─── N [Message]
                                       │
                                       ├── 1 [Book] ── 1 [Author]
                                       ├── 1 [Persona]
                                       ├── 1..3 [ReadingNote]
                                       └── 0..1 [Reflection]
```

- **Discussion** 이 핵심 Aggregate Root — 책·노트·페르소나·참가자·메시지가 모두 하나의 Discussion 컨텍스트로 묶임.
- 다른 Aggregate 들(`ReadingNote`, `Reflection`, `Book`, `Persona`, `User`) 은 ID 로만 참조됨.

---

## 1. Value Objects (VO)

### 1-1. 식별자 (ID)

모든 Entity 는 고유 ID 를 가진다. **UUID v7** 사용 (시간 정렬 가능, DB 인덱스 친화).

| ID 타입         | 대상          |
| --------------- | ------------- |
| `UserId`        | `User`        |
| `BookId`        | `Book`        |
| `AuthorId`      | `Author`      |
| `PersonaId`     | `Persona`     |
| `ReadingNoteId` | `ReadingNote` |
| `DiscussionId`  | `Discussion`  |
| `MessageId`     | `Message`     |
| `ParticipantId` | `Participant` |
| `ReflectionId`  | `Reflection`  |

→ 코드에서는 `type BookId = string & { readonly __brand: 'BookId' }` 같은 branded type 으로 표현해 타입 안전성 확보.

### 1-2. 열거형 VO

#### `NoteSource`

- `PHOTO` — 사진으로 캡처
- `TEXT` — 텍스트로 직접 입력

#### `Role`

- `USER` — 실제 사용자
- `AI` — AI 페르소나

#### `DiscussionStatus`

- `ACTIVE` — 진행 중 (메시지 추가 가능)
- `COMPLETED` — 정상 종료 (회고 작성 가능)
- `ABANDONED` — 미완 종료 (24시간 무응답 또는 사용자 탈퇴)

#### `PersonaCategory`

- `STUDIOUS` (학구파 독서 친구) — 기본
- `CASUAL` (캐주얼 친구)
- `CRITIC` (비평가)
- `POETIC` (시인 / 감성적) — 옵션
- `PHILOSOPHICAL` (철학적 친구) — 옵션

#### `Mood` (Reflection 옵션 필드)

- `POSITIVE` | `NEUTRAL` | `NEGATIVE`

---

## 2. Entities

### 2-1. `User`

사용자 식별·기본 프로필. Supabase Auth 와 1:1 매핑.

**필드**:

- `id: UserId`
- `email: string` (Supabase Auth 와 동일)
- `nickname: string`
- `createdAt: Date`

**정적 팩토리**:

- `User.register(email, nickname): User` — Supabase Auth 가입 직후 호출
- `User.restore(id, email, nickname, createdAt): User` — Repository 에서 사용

**불변 규칙**:

- `email` 은 Supabase Auth 의 user.email 과 동일
- `nickname` 은 1~30자, 공백 trim 후 빈 문자열 X

**도메인 메소드**:

- `changeNickname(newNickname): User` — 새 인스턴스 반환

---

### 2-2. `Author`

작가 정보.

**필드**:

- `id: AuthorId`
- `name: string`
- `birthYear: number | null`
- `deathYear: number | null`
- `nationality: string | null`

**정적 팩토리**:

- `Author.from(name, birthYear?, deathYear?, nationality?): Author`
- `Author.restore(...): Author`

**불변 규칙**:

- `name` 은 빈 문자열 X
- `deathYear` 가 있으면 `birthYear` 보다 커야 함

**도메인 메소드**:

- `isCopyrightExpired(currentYear): boolean` — 사망 후 70년 경과 (한국 저작권법). **V1 미사용**, 향후 작가 페르소나 도입 시 활용 가능.

---

### 2-3. `Book`

책 메타데이터. 하이브리드 토론 모드의 시스템 프롬프트 주입에 사용.

**필드**:

- `id: BookId`
- `title: string`
- `authorId: AuthorId`
- `genre: string`
- `summary: string` (~200자, 시스템 프롬프트 주입용)
- `authorStyle: string | null` (저자 문체 특징, 큐레이션 옵션)
- `coverImageUrl: string | null`
- `externalSource: 'NAVER' | 'GOOGLE_BOOKS' | 'MANUAL'`
- `externalId: string | null` (외부 API 의 책 ID)

**정적 팩토리**:

- `Book.fromExternal(source, externalData): Book` — 외부 도서 API 응답으로부터
- `Book.restore(...): Book`

**불변 규칙**:

- `title`, `authorId` 필수
- `summary` 200자 이내

---

### 2-4. `Persona`

AI 페르소나. 시스템에서 큐레이션·제공 (사용자 생성 X).

**필드**:

- `id: PersonaId`
- `category: PersonaCategory`
- `displayName: string` (예: "학구파 독서 친구")
- `description: string` (사용자에게 노출되는 짧은 소개)
- `systemPrompt: string` (Claude API 시스템 프롬프트)
- `isDefault: boolean`

**정적 팩토리**:

- `Persona.create(category, displayName, description, systemPrompt, isDefault): Persona`
- `Persona.restore(...): Persona`

**불변 규칙**:

- `systemPrompt` 빈 문자열 X
- `isDefault: true` 인 Persona 는 시스템 전체에서 정확히 1개

---

### 2-5. `ReadingNote`

인상 깊은 구절. 사진 또는 텍스트.

**필드**:

- `id: ReadingNoteId`
- `userId: UserId` (소유자)
- `bookId: BookId`
- `source: NoteSource`
- `content: string` (텍스트 또는 사진에서 추출한 텍스트)
- `photoUrl: string | null`
- `createdAt: Date`

**정적 팩토리**:

- `ReadingNote.fromText(userId, bookId, content): ReadingNote`
- `ReadingNote.fromPhoto(userId, bookId, photoUrl, extractedText): ReadingNote`
- `ReadingNote.restore(...): ReadingNote`

**불변 규칙**:

- `content` 는 1~5000자
- `source = PHOTO` 면 `photoUrl` 필수
- `source = TEXT` 면 `photoUrl` 은 null

**도메인 메소드**:

- `belongsTo(user: User): boolean` — 권한 검증 Specification

---

### 2-6. `Participant`

토론 참가자. User 또는 AI Persona 참조. **다중 사용자 확장 대비** (현재 V1 은 USER 1 + AI 1).

**필드**:

- `id: ParticipantId`
- `discussionId: DiscussionId`
- `role: Role`
- `userId: UserId | null` (role = USER 면 필수)
- `personaId: PersonaId | null` (role = AI 면 필수)
- `joinedAt: Date`

**정적 팩토리**:

- `Participant.asUser(discussionId, userId): Participant`
- `Participant.asAi(discussionId, personaId): Participant`

**불변 규칙**:

- USER 는 `userId` 필수, `personaId` null
- AI 는 `personaId` 필수, `userId` null
- 같은 Discussion 안에 동일한 (role, userId / personaId) 조합 중복 X

---

### 2-7. `Message`

토론 내 발화.

**필드**:

- `id: MessageId`
- `discussionId: DiscussionId`
- `participantId: ParticipantId`
- `role: Role` (Participant.role 캐싱 — 조회 효율)
- `content: string`
- `sentAt: Date`

**정적 팩토리**:

- `Message.from(discussionId, participant, content): Message`

**불변 규칙**:

- `content` 1~10000자
- `role` 은 `participantId` 가 가리키는 Participant 의 role 과 일치

---

### 2-8. `Discussion` (Aggregate Root)

책 + 노트 + 페르소나 + 참가자 묶음 토론 세션. **트랜잭션 경계**.

**필드**:

- `id: DiscussionId`
- `bookId: BookId`
- `noteIds: ReadingNoteId[]` (1~3개)
- `personaId: PersonaId`
- `participants: Participant[]` (V1: USER 1 + AI 1)
- `messages: Message[]`
- `status: DiscussionStatus`
- `startedAt: Date`
- `endedAt: Date | null`

**정적 팩토리**:

- `Discussion.start(book, notes, persona, user): Discussion`
  - `participants = [Participant.asUser(...), Participant.asAi(...)]`
  - `messages = []`
  - `status = ACTIVE`, `endedAt = null`
- `Discussion.restore(...): Discussion`

**불변 규칙**:

- `noteIds` 길이 1~3
- `participants` 는 USER 정확히 1명 + AI 정확히 1명 (V1)
- `status = COMPLETED` 또는 `ABANDONED` 면 `endedAt` 필수
- `status != ACTIVE` 면 메시지 추가 불가

**상태 전이**:

```
       start
        ↓
     ACTIVE ──── addUserMessage / addAiMessage ──→ ACTIVE
        │
        ├── complete ─→ COMPLETED  (사용자가 종료)
        │
        └── abandon  ─→ ABANDONED  (24h 무응답 또는 사용자 탈퇴)
```

**도메인 메소드**:

- `addUserMessage(content): Discussion` — 새 인스턴스 반환, `MessageAdded` 이벤트 발행
- `addAiMessage(content): Discussion`
- `complete(): Discussion` — `endedAt` 설정, `DiscussionCompleted` 이벤트 발행
- `abandon(): Discussion`
- `canBeReadBy(user: User): boolean` — 참가자 중 해당 User 가 있는지
- `messageCount(): number`
- `lastMessage(): Message | null`
- `userParticipant(): Participant` — USER role 참가자 조회 헬퍼
- `aiParticipant(): Participant`

---

### 2-9. `Reflection`

토론 종료 후 본인 회고 노트. 저널링 가치 (ADR-010) 의 핵심.

**필드**:

- `id: ReflectionId`
- `discussionId: DiscussionId`
- `userId: UserId`
- `content: string`
- `mood: Mood | null` (옵션)
- `tags: string[]` (옵션, 최대 5개)
- `createdAt: Date`
- `updatedAt: Date`

**정적 팩토리**:

- `Reflection.write(discussionId, userId, content, mood?, tags?): Reflection`
- `Reflection.restore(...): Reflection`

**불변 규칙**:

- `content` 1~10000자
- `tags` 최대 5개, 각 1~20자
- 작성 가능 조건: 해당 `discussionId` 의 `status = COMPLETED` (Application 계층에서 검증)

**도메인 메소드**:

- `update(content, mood?, tags?): Reflection` — `updatedAt` 갱신, 새 인스턴스
- `belongsTo(user: User): boolean`

---

## 3. 도메인 이벤트

| 이벤트                | 발생 시점               | 페이로드                                       |
| --------------------- | ----------------------- | ---------------------------------------------- |
| `DiscussionStarted`   | Discussion 생성 시      | `discussionId, bookId, personaId, userId`      |
| `MessageAdded`        | Message 추가 시         | `discussionId, messageId, role`                |
| `DiscussionCompleted` | Discussion 완료 시      | `discussionId, userId, messageCount, duration` |
| `DiscussionAbandoned` | Discussion 미완 종료 시 | `discussionId, userId, reason`                 |
| `ReflectionWritten`   | Reflection 작성 시      | `reflectionId, discussionId, userId`           |
| `ReadingNoteCaptured` | ReadingNote 추가 시     | `noteId, userId, bookId, source`               |

→ 모든 이벤트는 **과거형** 명명. **트랜잭션 커밋 후 발행** (Outbox 패턴 또는 Supabase 트리거).

---

## 4. Aggregate 경계 (트랜잭션 단위)

| Aggregate     | 포함                                   | 외부 참조 (ID 만)                            |
| ------------- | -------------------------------------- | -------------------------------------------- |
| `Discussion`  | Discussion + Participant[] + Message[] | `bookId`, `noteIds[]`, `personaId`, `userId` |
| `ReadingNote` | ReadingNote 단독                       | `bookId`, `userId`                           |
| `Reflection`  | Reflection 단독                        | `discussionId`, `userId`                     |
| `Book`        | Book + Author 참조                     | `authorId`                                   |
| `Persona`     | Persona 단독                           | —                                            |
| `User`        | User 단독                              | —                                            |
| `Author`      | Author 단독                            | —                                            |

→ Aggregate 간 참조는 **ID 로만**. 객체 직접 참조 금지 (도메인 침범 방지).

---

## 5. 권한 Specification (ADR-004 — RLS 와 이중 방어)

| Specification         | 의미                                     |
| --------------------- | ---------------------------------------- |
| `CanReadDiscussion`   | 사용자가 해당 Discussion 의 참가자인가   |
| `CanWriteReadingNote` | 사용자 본인의 노트인가                   |
| `CanWriteReflection`  | Discussion 참가자이며 status = COMPLETED |
| `CanReadReflection`   | 본인이 작성한 회고인가                   |

→ 위치: `lib/domain/<aggregate>/specs/can-*.spec.ts`

---

## 6. 핵심 불변 규칙 (요약)

- **불변성**: 모든 도메인 객체는 readonly 필드. 상태 변경 시 새 인스턴스 반환.
- **외부 의존성 0**: `lib/domain/` 에서 Next.js · Supabase · Claude SDK · React 모두 import 금지 (ADR-003).
- **Aggregate 간 참조는 ID 로만** — 객체 직접 참조 금지.
- **권한 검증은 Specification 으로** — RLS 와 별개로 도메인 단계에서도 검증.
- **What 기반 네이밍** — `register`, `start`, `addMessage`, `complete`, `abandon`, `write`, `update`.
- **정적 팩토리 메소드만 사용** — `new` 직접 호출 금지 (private 생성자).

---

## 7. 다음 단계

이 도메인 모델을 기반으로:

- [`data-model.md`](./data-model.md) — Supabase 테이블·관계·RLS 정책 (도메인 → SQL 매핑)
- [`features/`](./features/) — 각 핵심 기능의 입출력·흐름·예외
- `lib/domain/` 코드 작성 — 위 명세 1:1 구현
