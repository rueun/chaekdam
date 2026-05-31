# 기능 06: 회고·기록 작성

> US-9 — 종료된 토론에 대한 본인 회고 노트를 작성한다. 저널링 가치 (ADR-010) 의 핵심.

## 입력

- `discussionId: DiscussionId`
- `content: string` (1~10000자)
- `mood: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null` (옵션)
- `tags: string[]` (옵션, 최대 5개, 각 1~20자)

## 동작 흐름

1. 토론 종료 후 자동으로 회고 작성 화면 진입
2. 사용자가 폼 작성:
   - 본문 (자유 입력)
   - 기분 (이모지 라디오: 😊 😐 😔)
   - 태그 (옵션, 자동완성 — 본인이 사용했던 태그)
3. "저장" 또는 "건너뛰기" 선택
4. **저장 시**:
   - Server Action `writeReflection(input)` 호출
   - `Reflection.write(...)` → `Repository.save`
   - `ReflectionWritten` 이벤트 발행
   - 홈으로 라우팅
5. **건너뛰기 시**:
   - 회고 미생성 상태로 홈 라우팅
   - 다음 진입 시 "마지막 토론에 회고를 남기시겠어요?" 옵션 제공 (P2)

### 회고 수정

1. 토론 상세 화면에서 기존 회고가 있으면 "수정" 버튼 노출
2. `Reflection.update(content, mood?, tags?)` 호출 → `updatedAt` 갱신

## API / Server Action

```typescript
// app/(dashboard)/reflections/actions.ts
'use server';

export async function writeReflection(input: {
  discussionId: DiscussionId;
  content: string;
  mood?: Mood;
  tags?: string[];
}): Promise<{ reflectionId: ReflectionId }> {
  /*
   * 1. zod 검증
   * 2. Discussion 조회 → status === 'COMPLETED' 확인 (CanWriteReflection Spec)
   * 3. Reflection.write + 저장
   * 4. revalidatePath
   */
}

export async function updateReflection(input: {
  reflectionId: ReflectionId;
  content: string;
  mood?: Mood;
  tags?: string[];
}): Promise<void>;
```

## 도메인 Port

- `DiscussionRepository.findById(id): Promise<Discussion>`
- `ReflectionRepository.findByDiscussionAndUser(discussionId, userId): Promise<Reflection | null>`
- `ReflectionRepository.save(reflection): Promise<void>`
- `AuthSession.currentUserId(): Promise<UserId>`

## Specification

`CanWriteReflection`:

- Discussion 의 status === 'COMPLETED'
- 사용자가 Discussion 의 USER 참가자
- 같은 Discussion 에 본인 회고가 이미 없음 (UNIQUE 제약)

→ 위치: `lib/domain/reflection/specs/can-write-reflection.spec.ts`

## zod 스키마

```typescript
export const writeReflectionSchema = z.object({
  discussionId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  mood: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  tags: z.array(z.string().min(1).max(20)).max(5).optional(),
});
```

## 예외

| 상황                             | 처리                                         |
| -------------------------------- | -------------------------------------------- |
| Discussion `status != COMPLETED` | "토론을 먼저 종료해주세요"                   |
| 본인이 참가자 아님               | 403 (RLS 도 차단)                            |
| 이미 회고가 존재 (UNIQUE 위반)   | "이미 작성된 회고가 있어요. 수정하시겠어요?" |
| 태그 6개째 추가                  | 클라이언트 거부 + 안내                       |
| 본문 빈 문자열                   | 거부 (zod)                                   |

## UI 상태

```
idle (폼 표시) ──(저장)──> saving ──> saved (홈 이동)
       │
       └─(건너뛰기)──> 홈 이동
```

- 저장 중 버튼 비활성
- 저장 성공 시 토스트 ("회고가 저장됐어요")
- 폼 자동 저장 (드래프트) — 새로고침 시 복구 (V2 검토)

## 검증

- **도메인**:
  - `Reflection.write` 의 길이·태그 수 검증
  - `Reflection.update` 가 `updatedAt` 갱신 + 새 인스턴스 반환
  - `CanWriteReflection` Specification (status COMPLETED 검증)
- **통합**:
  - UNIQUE (`discussion_id`, `user_id`) 제약 동작
  - RLS 가 다른 사용자 회고 차단
- **E2E**:
  - 토론 종료 → 회고 작성 → 홈에서 노출

## 보안

- 본인 회고만 SELECT/UPDATE/DELETE (RLS)
- `discussionId` 가 본인 토론인지 검증 (Specification + RLS)
- 태그는 trim + 유효성 검사 (XSS 방지)

## UX 디테일

- 토론 종료 직후 자동 진입 — 사용자가 가장 생각이 풍부한 순간
- "건너뛰기" 강조 X (자연스럽게 작성 유도)
- 기분 선택은 옵션 — 클릭 안 해도 저장 가능
- 태그 자동완성: 본인이 이전에 사용한 태그 제안
- 모바일에서 본문 입력란은 키보드 자동 포커스
