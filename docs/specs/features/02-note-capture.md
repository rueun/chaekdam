# 기능 02: 인상 깊은 구절 캡처

> US-3, US-4 — 사진 또는 텍스트로 책의 인상 깊은 구절을 노트로 만든다.

## 입력

### 사진 모드 (US-3)

- `bookId: BookId`
- `photoFile: File` (이미지, 10MB 이내)

### 텍스트 모드 (US-4)

- `bookId: BookId`
- `content: string` (1~5000자)

## 동작 흐름

### 사진 모드

1. 사용자가 `<input type="file" accept="image/*" capture="environment">` 로 사진 촬영·업로드
2. Client 가 사진을 Supabase Storage 의 `reading-note-photos/<user_id>/<uuid>.jpg` 로 업로드
3. 업로드 성공 후 Storage URL 받음
4. Server Action `extractTextFromPhoto(photoUrl)` 호출
5. Claude API (vision) 가 사진에서 텍스트 추출
6. 추출된 텍스트를 사용자에게 미리보기·수정 가능하게 표시
7. 사용자가 확정 → `ReadingNote.fromPhoto()` 로 저장

### 텍스트 모드

1. 사용자가 텍스트 입력 (zod 스키마 클라이언트 검증)
2. Server Action `createNoteFromText(bookId, content)` 호출
3. `ReadingNote.fromText()` 로 저장

### 공통

- 노트는 1~3개까지 누적 가능
- "노트 더 추가" 버튼 또는 "다음 →" (페르소나 선택)

## API / Server Action

```typescript
// app/(dashboard)/notes/actions.ts
'use server';

export async function uploadPhotoForNote(
  formData: FormData,
): Promise<{ photoUrl: string; extractedText: string }> {
  /* Storage 업로드 + Claude vision 호출 */
}

export async function createNoteFromText(
  input: CreateNoteInput,
): Promise<{ noteId: ReadingNoteId }> {
  /* zod 검증 + ReadingNote.fromText + Repository.save */
}

export async function createNoteFromPhoto(
  input: CreatePhotoNoteInput,
): Promise<{ noteId: ReadingNoteId }>;
```

## 도메인 Port

- `PhotoStorage.upload(userId, file): Promise<{ url: string }>`
- `AiVisionExtractor.extractText(photoUrl): Promise<string>` ← Claude vision Adapter
- `ReadingNoteRepository.save(note): Promise<void>`

## zod 스키마

```typescript
// lib/domain/reading-note/schemas.ts (외부 의존 0)
import { z } from 'zod';

export const createNoteFromTextSchema = z.object({
  bookId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const createNoteFromPhotoSchema = z.object({
  bookId: z.string().uuid(),
  photoUrl: z.string().url(),
  extractedText: z.string().min(1).max(5000),
});
```

→ Server Action 에서 `parse()` 로 동일 스키마 재사용 (단일 진실 공급원).

## 예외

| 상황                       | 처리                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| 파일 크기 10MB 초과        | 클라이언트 거부 + 안내                                             |
| 이미지가 아닌 파일         | 거부                                                               |
| Vision OCR 실패 (텍스트 0) | "텍스트를 인식하지 못했어요. 직접 입력해주세요" + 텍스트 모드 폴백 |
| Storage 업로드 실패        | 1회 재시도 후 실패 보고                                            |
| 노트 4개째 추가 시도       | "최대 3개까지 추가할 수 있어요"                                    |

## UI 상태

- 사진 모드: `idle → uploading → extracting → previewing → saved`
- 텍스트 모드: `idle → typing → saving → saved`
- 에러: 각 단계별 폴백 UI

## 검증

- **도메인**:
  - `ReadingNote.fromText` 의 길이 검증
  - `ReadingNote.fromPhoto` 의 photoUrl 필수 검증
  - source 와 photoUrl 의 일관성 (`PHOTO` 면 photoUrl 필수)
- **통합**:
  - 실제 Storage 업로드 + RLS 정책 (본인 폴더만 가능)
  - Vision 호출 결과 매핑
- **E2E**:
  - 사진 업로드 → 추출 → 저장 (테스트 픽스처 이미지 사용)

## UX 디테일

- 모바일 사진 모드는 카메라 즉시 호출 (`capture="environment"`)
- 추출된 텍스트는 편집 가능 (OCR 오타 수정)
- 텍스트 모드는 모바일에서 자동 줄바꿈
- 노트 누적 시 "1/3", "2/3" 진행 표시

## 보안

- Vision 호출은 서버 측 (`ANTHROPIC_API_KEY` 보호)
- 사진은 본인 폴더(`<user_id>/...`) 에만 저장 (Storage RLS)
- 사진 URL 은 signed URL 또는 RLS 보호 (직접 노출 X)
