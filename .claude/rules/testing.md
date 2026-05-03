---
name: 책담 — 테스트 규칙
description: Vitest 단위, Playwright E2E, Supabase 로컬 환경 활용
type: feedback
---

# 테스트 규칙 (chaekdam)

## 도메인 단위 테스트 (Vitest)

- `lib/domain/` 의 순수 함수·클래스 테스트
- Next.js·Supabase 의존성 없이 빠르게 실행

```typescript
import { describe, it, expect } from 'vitest';
import { ReadingNote } from '@/lib/domain/reading-note/reading-note';

describe('ReadingNote', () => {
    it('텍스트 구절로부터 노트를 생성한다', () => {
        const note = ReadingNote.fromText('book-1', '인상 깊은 한 구절');
        expect(note.source).toBe('TEXT');
        expect(note.photoUrl).toBeNull();
    });

    it('빈 본문으로는 생성할 수 없다', () => {
        expect(() => ReadingNote.fromText('book-1', '')).toThrow();
    });
});
```

## 유스케이스 테스트

- `lib/application/` 의 유스케이스 테스트
- Port를 Fake / Stub으로 주입 (Mock 대신 진짜 구현 우선)

```typescript
class InMemoryDiscussionRepository implements DiscussionRepository { /* ... */ }
class FakeAiDiscussionPartner implements AiDiscussionPartner { /* ... */ }

it('토론을 시작하면 첫 AI 응답이 포함된다', async () => {
    const useCase = new StartDiscussionUseCase(
        new InMemoryDiscussionRepository(),
        new FakeAiDiscussionPartner(),
    );
    const result = await useCase.execute({ bookId: 'b1', readingNoteIds: ['n1'] });
    expect(result.messages).toHaveLength(1);
});
```

## 통합 테스트 (Supabase 로컬)

- `supabase start`로 로컬 PostgreSQL + Auth 실행
- 실제 RLS 정책까지 검증
- CI에서도 supabase 로컬 환경 실행

```typescript
import { createClient } from '@supabase/supabase-js';

describe('SupabaseReadingNoteRepository', () => {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
    );

    it('노트를 저장하고 조회할 수 있다', async () => {
        const note = ReadingNote.fromText('b1', '구절');
        const repo = new SupabaseReadingNoteRepository(supabase);
        await repo.save(note);
        const found = await repo.findById(note.id);
        expect(found?.content).toBe('구절');
    });
});
```

## E2E 테스트 (Playwright)

- 핵심 사용자 시나리오만 (5~10개 플로우)
- 너무 많이 만들면 유지보수 부담

핵심 시나리오 후보:
- 회원가입 → 로그인 → 책 검색 → 선택 → 노트 추가 → 토론 시작 → 메시지 1턴
- 사진 업로드 → 자동 구절 추출 → 토론 시작
- 본인 토론 기록 조회

```typescript
import { test, expect } from '@playwright/test';

test('사용자가 사진으로 노트를 만들고 토론을 시작한다', async ({ page }) => {
    await page.goto('/login');
    // ... 로그인
    await page.goto('/books/search');
    await page.fill('[name="query"]', '데미안');
    await page.click('button:has-text("검색")');
    await page.click('text=데미안');
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/page.jpg');
    await page.click('text=토론 시작');
    await expect(page).toHaveURL(/\/discussions\/\w+/);
});
```

## Mock 사용 기준

- ❌ Supabase 클라이언트를 Mock 처리 금지 — RLS 동작 검증 불가
- ❌ 도메인 로직 Mock 금지
- ✅ Claude API는 통합 테스트에서 Fake 구현체로 대체 가능 (응답 결정성 + 비용 절감)
- ✅ 외부 도서 API (네이버 / Google Books) Mock 가능

## Server Actions 테스트

- 서버 액션은 일반 async 함수 — Vitest로 직접 호출 가능
- DB 의존이 있다면 통합 테스트로 처리

## 도메인 모듈 테스트는 필수

`~/.claude/rules/workflow.md` 의 원칙: 도메인 모듈에 대한 테스트는 **반드시 작성**.

## CI 환경

- GitHub Actions에서 supabase CLI 설치 → `supabase start`
- 마이그레이션 적용 후 통합 테스트 실행
- E2E는 Vercel Preview URL에 대해 실행 가능
