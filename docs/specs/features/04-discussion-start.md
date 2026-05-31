# 기능 04: 토론 시작

> US-6 — 책·노트·페르소나가 준비된 상태에서 AI 토론을 시작한다. 하이브리드 모드 컨텍스트 구성.

## 입력

- `bookId: BookId`
- `noteIds: ReadingNoteId[]` (1~3개)
- `personaId: PersonaId`
- 사용자 (`auth.uid()` 으로 자동)

## 동작 흐름

1. 페르소나 선택 화면에서 "토론 시작" 버튼 클릭
2. Server Action `startDiscussion(bookId, noteIds, personaId)` 호출
3. **Aggregate 생성**:
   - `Discussion.start(book, notes, persona, user)` 정적 팩토리
   - `Participant.asUser(discussionId, userId)` 추가
   - `Participant.asAi(discussionId, personaId)` 추가
   - `status = ACTIVE`, `messages = []`
4. **트랜잭션** (Discussion + Participants + DiscussionNotes 한 번에):
   - `discussions` INSERT
   - `participants` INSERT × 2 (USER + AI)
   - `discussion_notes` INSERT × N (선택된 노트들)
5. **Claude API 호출 — 첫 응답 생성**:
   - 시스템 프롬프트: 페르소나 system_prompt + 책 메타(title, author, genre, summary, authorStyle)
   - **프롬프트 캐싱 활용** (cache_control: ephemeral)
   - 사용자 메시지: 노트 내용들 + "이 구절에 대해 함께 이야기해요" 같은 진입 멘트
   - 스트리밍 응답
6. AI 응답을 `Message` 로 저장 (`role = AI`, `participantId = AI participant`)
7. `DiscussionStarted` 이벤트 발행
8. 채팅 화면으로 라우팅 → URL: `/discussions/[id]`

## API / Server Action

```typescript
// app/(dashboard)/discussions/actions.ts
'use server';

export async function startDiscussion(input: {
  bookId: BookId;
  noteIds: ReadingNoteId[];
  personaId: PersonaId;
}): Promise<{ discussionId: DiscussionId }> {
  /*
   * 1. zod 검증
   * 2. Application 유스케이스 호출
   * 3. revalidatePath 후 리다이렉트
   */
}
```

## 도메인 Port

- `BookRepository.findById(id): Promise<Book>`
- `ReadingNoteRepository.findManyByIds(ids): Promise<ReadingNote[]>`
- `PersonaRepository.findById(id): Promise<Persona>`
- `AuthSession.currentUserId(): Promise<UserId>`
- `DiscussionRepository.save(discussion): Promise<void>` (Aggregate 통째로 저장)
- `AiDiscussionPartner.startDiscussion(context, firstMessage): AsyncIterable<string>` (스트리밍)

## 시스템 프롬프트 구조 (하이브리드 모드)

```
[페르소나 시스템 프롬프트]
당신은 {persona.displayName}입니다. {persona.systemPrompt}

[책 메타데이터 — 프롬프트 캐싱]
지금 사용자가 함께 이야기하고자 하는 책은 다음과 같습니다:
- 제목: {book.title}
- 저자: {author.name}
- 장르: {book.genre}
- 간단 요약: {book.summary}
- 저자 스타일: {book.authorStyle}

위 책의 인상 깊은 구절에 대해 사용자와 5~10턴 정도의 깊이 있는 대화를 진행하세요.

[사용자 첫 메시지]
인상 깊은 구절을 가져왔어요:

> {note1.content}
> {note2.content}
> {note3.content}

이 부분이 마음에 남았어요. 함께 이야기해주세요.
```

→ 페르소나 + 책 메타는 **시스템 메시지** (캐싱), 노트는 **첫 사용자 메시지** (가변).

## 예외

| 상황                 | 처리                                                    |
| -------------------- | ------------------------------------------------------- |
| 노트 0개             | "구절을 먼저 추가해주세요"                              |
| 노트 4개째           | "최대 3개까지 선택할 수 있어요"                         |
| 페르소나 ID 미존재   | 기본 페르소나로 폴백                                    |
| 책 ID 미존재         | 에러 — 다시 책 선택                                     |
| Claude API 호출 실패 | Discussion 은 생성 (ACTIVE) 후 사용자가 채팅에서 재시도 |
| 트랜잭션 실패        | 전체 롤백, 사용자에게 에러 보고                         |

## UI 상태

- "토론 시작" 버튼 클릭 → 로딩 (스피너) → 채팅 화면 전환
- 첫 AI 응답 스트리밍 시작 → 글자가 한 글자씩 나타남
- 에러 시: 토스트 + 재시도 버튼

## 검증

- **도메인**:
  - `Discussion.start` 의 participants 구성 검증 (USER 1 + AI 1)
  - `noteIds` 1~3개 제약 검증
  - `Discussion` 의 status 가 ACTIVE 인지
- **통합**:
  - 트랜잭션 (discussions + participants + discussion_notes) 일관성
  - Claude API Adapter 가 시스템 프롬프트를 정확히 구성하는지
  - 프롬프트 캐싱 활성화 여부 확인 (응답 헤더 / 사용량)
- **E2E**:
  - 페르소나 선택 → 시작 → 첫 AI 응답까지 한 시나리오

## 보안

- `personaId`, `bookId`, `noteIds` 모두 zod 검증
- 노트 소유권 검증 (`ReadingNote.belongsTo(user)`) — RLS + 도메인 Spec 이중 방어
- `ANTHROPIC_API_KEY` 는 서버 전용

## 성능

- 첫 응답 스트리밍으로 체감 속도 ↑
- 프롬프트 캐싱으로 두 번째 메시지부터 비용·시간 ↓
- Claude API 타임아웃 30초 (긴 응답 허용)
