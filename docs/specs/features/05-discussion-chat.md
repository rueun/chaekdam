# 기능 05: 토론 채팅 진행 / 종료

> US-7, US-8 — 시작된 토론에서 메시지를 주고받고, 종료 버튼으로 완료한다.

## 입력

### 메시지 추가

- `discussionId: DiscussionId`
- `content: string` (1~10000자)

### 토론 종료

- `discussionId: DiscussionId`

## 동작 흐름

### 메시지 송수신

1. 사용자가 채팅 입력창에 메시지 입력
2. Server Action `sendMessage(discussionId, content)` 호출
3. **사용자 메시지 저장**:
   - `Discussion.findById` → `addUserMessage(content)` → `Repository.save`
4. **AI 응답 생성**:
   - 전체 message history + 시스템 프롬프트(캐싱) → Claude API 스트리밍
   - 응답을 SSE 로 클라이언트에 전송
5. **AI 메시지 저장**:
   - 스트리밍 완료 후 `Discussion.addAiMessage(fullContent)` → `Repository.save`
6. `MessageAdded` 이벤트 발행

### 토론 종료

1. 사용자가 "토론 종료" 버튼 클릭
2. 확인 다이얼로그 (`overlay-kit`) — "정말 종료하시겠어요?"
3. `Discussion.complete()` → `Repository.save`
4. `DiscussionCompleted` 이벤트 발행
5. 회고 작성 화면으로 자동 이동 (`features/06-reflection`)

## API / Server Action

```typescript
// app/(dashboard)/discussions/[id]/actions.ts
'use server';

export async function sendMessage(input: {
  discussionId: DiscussionId;
  content: string;
}): Promise<ReadableStream<string>> {
  /*
   * 1. zod 검증
   * 2. Discussion 조회 + 권한 검증 (canBeReadBy)
   * 3. addUserMessage + 저장
   * 4. AiDiscussionPartner.continue() 스트리밍 호출
   * 5. 스트림 완료 후 addAiMessage + 저장
   */
}

export async function completeDiscussion(discussionId: DiscussionId): Promise<void> {
  /*
   * 1. Discussion 조회 + 권한 검증
   * 2. complete() 호출
   * 3. 저장 + revalidate
   */
}
```

## 도메인 Port

- `DiscussionRepository.findById(id): Promise<Discussion>`
- `DiscussionRepository.save(discussion): Promise<void>`
- `AiDiscussionPartner.continue(history, systemContext): AsyncIterable<string>` (스트리밍)
- `AuthSession.currentUserId(): Promise<UserId>`

## Claude API 호출 (continue)

```
[시스템 메시지 — 캐싱 유지]
- 페르소나 systemPrompt
- 책 메타

[메시지 history]
- 첫 사용자 메시지 (노트들)
- AI 첫 응답
- 사용자 메시지 1
- AI 응답 1
- ...
- 사용자 메시지 N (방금 전송)

[Claude 응답 — 스트리밍]
```

→ history 가 누적될수록 토큰 비용 증가. 평균 5~10턴 가정 시 안전.

## 예외

| 상황                           | 처리                                                 |
| ------------------------------ | ---------------------------------------------------- |
| `status != ACTIVE`             | "이미 종료된 토론입니다" + 채팅 잠금                 |
| 권한 없음 (`canBeReadBy` 거짓) | 404 또는 403                                         |
| Claude API 실패                | 사용자 메시지는 저장됨, AI 응답만 실패 → 재시도 버튼 |
| 스트리밍 중단 (네트워크)       | 부분 응답 저장 + 재시도 가능                         |
| 메시지 길이 초과               | 클라이언트 사전 거부 + zod 검증                      |
| 동시 송신 (race)               | 사용자 메시지가 순서대로 처리되도록 큐 (UI 잠금)     |

## UI 상태

```
idle ──(사용자 입력)──> sending
                         │
                         ├─ 사용자 메시지 표시
                         └─ AI 응답 streaming (글자 단위)
                              │
                              └── 완료 → idle
```

- 입력창 비활성 (응답 중)
- 응답 도중 "중지" 버튼 (옵션)
- 자동 스크롤 (최신 메시지로)
- 종료 버튼은 항상 노출, status 가 ACTIVE 일 때만 활성

## 검증

- **도메인**:
  - `addUserMessage`, `addAiMessage` 가 새 인스턴스 반환
  - `complete()` 가 status 전환 + endedAt 설정
  - `status != ACTIVE` 에서 메시지 추가 시 예외
- **통합**:
  - 메시지 INSERT 가 RLS 통과 (참가자만)
  - Claude API Adapter 가 history 를 정확히 전달
- **E2E**:
  - 토론 시작 → 메시지 1턴 → 종료 → 회고 화면 진입

## 보안

- 메시지 송신 전 권한 검증 (`canBeReadBy(user)`)
- RLS 가 다른 사용자의 토론 메시지 SELECT 차단
- AI 응답 콘텐츠 정화 (XSS 방지) — 마크다운 렌더링 시 sanitize

## 성능

- 메시지 history 가 길어지면 (20턴+) Claude 토큰 비용 ↑
- V1 은 무제한 허용. 사용량 모니터링 후 정책 결정
- 메시지 목록 가상 스크롤 (100개 이상 시) — V2 검토

## UX 디테일

- 메시지 입력창은 Enter = 전송, Shift+Enter = 줄바꿈 (옵션)
- 모바일에서는 전송 버튼 명시적
- 스트리밍 중에 입력 비활성화 명확히 (스피너 또는 "AI가 답변 중...")
- 마크다운 렌더링 (AI 응답이 마크다운인 경우)
