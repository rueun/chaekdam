// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { createSupabaseAdminClient } from './admin-client';
import { supabaseEnv } from './env';
import { SupabaseHighlightRepository } from './supabase-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import { CaptureHighlightUseCase } from '@/lib/application/capture-highlight.use-case';

// 로컬 Supabase(`supabase start`) 가 떠 있어야 실행되는 통합 테스트.
// 실제 RLS 정책까지 검증한다(Supabase 클라이언트 Mock 금지 — testing 규칙).

/** 이메일/비밀번호로 로그인한 사용자 권한 클라이언트를 만든다. */
async function signInClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = supabaseEnv();
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe('SupabaseHighlightRepository (통합)', () => {
  const admin = createSupabaseAdminClient();
  const password = 'test-password-12345';
  const emailA = `a-${crypto.randomUUID()}@test.local`;
  const emailB = `b-${crypto.randomUUID()}@test.local`;
  let userAId: string;
  let userBId: string;
  let repoA: SupabaseHighlightRepository;
  let repoB: SupabaseHighlightRepository;

  beforeAll(async () => {
    // 사용자 생성 직후 즉시 id 를 보관 — 이후 단계가 실패해도 afterAll 이 정리할 수 있게.
    const a = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    if (a.error) throw a.error;
    userAId = a.data.user.id;

    const b = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    if (b.error) throw b.error;
    userBId = b.data.user.id;

    repoA = new SupabaseHighlightRepository(await signInClient(emailA, password));
    repoB = new SupabaseHighlightRepository(await signInClient(emailB, password));
  });

  afterAll(async () => {
    // 사용자 삭제 시 highlights 는 FK on delete cascade 로 함께 정리됨
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it('한 줄을 저장하고 id 로 조회한다', async () => {
    const bookId = crypto.randomUUID();
    const highlight = Highlight.fromText(bookId, '통합 테스트 문장', 'p.7');

    await repoA.save(highlight);
    const found = await repoA.findById(highlight.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(highlight.id);
    expect(found!.content).toBe('통합 테스트 문장');
    expect(found!.bookId).toBe(bookId);
    expect(found!.page).toBe('p.7');
    expect(found!.source).toBe('TEXT');
  });

  it('사진 한 줄도 photo_url 과 함께 왕복한다', async () => {
    const bookId = crypto.randomUUID();
    const highlight = Highlight.fromPhoto(bookId, 'https://x/y.jpg', '사진 추출 문장');

    await repoA.save(highlight);
    const found = await repoA.findById(highlight.id);

    expect(found!.isFromPhoto()).toBe(true);
    expect(found!.photoUrl).toBe('https://x/y.jpg');
  });

  it('책 id 로 그 책의 한 줄만 조회된다', async () => {
    const bookId = crypto.randomUUID();
    await repoA.save(Highlight.fromText(bookId, '첫 문장'));
    await repoA.save(Highlight.fromText(bookId, '둘째 문장'));
    await repoA.save(Highlight.fromText(crypto.randomUUID(), '다른 책 문장'));

    const list = await repoA.findByBookId(bookId);
    expect(list).toHaveLength(2);
    expect(list.map((h) => h.content)).toEqual(expect.arrayContaining(['첫 문장', '둘째 문장']));
  });

  it('캡처 배선 경로 — CaptureHighlightUseCase 로 담으면 실제 저장된다', async () => {
    // Server Action(captureHighlight)이 호출하는 경로: 유스케이스 → Supabase 어댑터 → DB
    const useCase = new CaptureHighlightUseCase(repoA);
    const { highlightId } = await useCase.execute({
      source: NoteSource.TEXT,
      bookId: crypto.randomUUID(),
      content: '유스케이스로 담은 문장',
      page: 'p.3',
    });

    const found = await repoA.findById(highlightId);
    expect(found?.content).toBe('유스케이스로 담은 문장');
    expect(found?.source).toBe('TEXT');
    expect(found?.page).toBe('p.3');
  });

  it('RLS — 다른 사용자의 한 줄은 조회되지 않는다', async () => {
    const bookId = crypto.randomUUID();
    const secret = Highlight.fromText(bookId, 'A 만의 문장');
    await repoA.save(secret);

    // B 권한으로는 A 의 한 줄이 보이지 않아야 한다
    expect(await repoB.findById(secret.id)).toBeNull();
    expect(await repoB.findByBookId(bookId)).toHaveLength(0);
  });
});
