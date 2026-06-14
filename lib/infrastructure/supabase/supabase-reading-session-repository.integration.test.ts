// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { createSupabaseAdminClient } from './admin-client';
import { supabaseEnv } from './env';
import { SupabaseReadingSessionRepository } from './supabase-reading-session-repository';
import { SupabaseBookRepository } from './supabase-book-repository';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';
import { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import { Book } from '@/lib/domain/book/book';
import { BookStatus } from '@/lib/domain/book/book-status';

// 로컬 Supabase(`supabase start`) 필요. 실제 RLS·FK 까지 검증(Mock 금지).

async function signInClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = supabaseEnv();
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe('SupabaseReadingSessionRepository (통합)', () => {
  const admin = createSupabaseAdminClient();
  const password = 'test-password-12345';
  const emailA = `session-a-${crypto.randomUUID()}@test.local`;
  const emailB = `session-b-${crypto.randomUUID()}@test.local`;
  let userAId: string;
  let userBId: string;
  let repoA: ReadingSessionRepository;
  let repoB: ReadingSessionRepository;
  let bookAId: string;
  let bookBId: string;

  beforeAll(async () => {
    const a = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    if (a.error) throw a.error;
    userAId = a.data.user.id;
    const b = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    if (b.error) throw b.error;
    userBId = b.data.user.id;

    const clientA = await signInClient(emailA, password);
    const clientB = await signInClient(emailB, password);
    repoA = new SupabaseReadingSessionRepository(clientA);
    repoB = new SupabaseReadingSessionRepository(clientB);

    // FK(book_id → books.id) 충족을 위해 사용자별 책을 만든다.
    const bookA = Book.register({
      title: `세션 책 A ${crypto.randomUUID()}`,
      status: BookStatus.READING,
    });
    const bookB = Book.register({
      title: `세션 책 B ${crypto.randomUUID()}`,
      status: BookStatus.READING,
    });
    await new SupabaseBookRepository(clientA).save(bookA);
    await new SupabaseBookRepository(clientB).save(bookB);
    bookAId = bookA.id;
    bookBId = bookB.id;
  });

  afterAll(async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it('세션을 저장하고 최근순으로 조회한다(페이지 범위 왕복)', async () => {
    await repoA.save(
      ReadingSession.log({
        bookId: bookAId,
        minutes: 30,
        startPage: 10,
        endPage: 42,
        occurredAt: new Date('2026-06-07T03:00:00Z'),
      }),
    );
    await repoA.save(
      ReadingSession.log({
        bookId: bookAId,
        minutes: 15,
        occurredAt: new Date('2026-06-06T03:00:00Z'),
      }),
    );

    const all = await repoA.findAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
    // 최근순(occurred_at desc) — 6/7 이 6/6 보다 먼저
    expect(all[0]!.occurredAt.getTime()).toBeGreaterThan(all[1]!.occurredAt.getTime());

    const withPages = all.find((s) => s.minutes === 30);
    expect(withPages?.startPage).toBe(10);
    expect(withPages?.endPage).toBe(42);
    expect(withPages?.pageSpan).toBe(32);

    const noPages = all.find((s) => s.minutes === 15);
    expect(noPages?.startPage).toBeNull();
    expect(noPages?.pageSpan).toBeNull();
  });

  it('RLS — 다른 사용자의 세션은 보이지 않는다', async () => {
    await repoA.save(ReadingSession.log({ bookId: bookAId, minutes: 20 }));
    await repoB.save(ReadingSession.log({ bookId: bookBId, minutes: 99 }));

    const allB = await repoB.findAll();
    expect(allB.some((s) => s.minutes === 99)).toBe(true);
    expect(allB.some((s) => s.bookId === bookAId)).toBe(false);
  });

  describe('DB 제약·RLS 이중 방어(도메인 우회 raw insert)', () => {
    // 도메인을 우회해 DB 제약/RLS 만 직접 검증한다.
    async function rawClientA(): Promise<SupabaseClient<Database>> {
      const { url, anonKey } = supabaseEnv();
      const raw = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
      await raw.auth.signInWithPassword({ email: emailA, password });
      return raw;
    }

    it('하루를 넘는 분은 거부된다(minutes 상한)', async () => {
      const raw = await rawClientA();
      const { error } = await raw
        .from('reading_sessions')
        .insert({ book_id: bookAId, minutes: 5000 });
      expect(error).not.toBeNull();
    });

    it('0분 이하는 거부된다(minutes 하한)', async () => {
      const raw = await rawClientA();
      const { error } = await raw.from('reading_sessions').insert({ book_id: bookAId, minutes: 0 });
      expect(error).not.toBeNull();
    });

    it('페이지가 한쪽만 있으면 거부된다(page_pair)', async () => {
      const raw = await rawClientA();
      const { error } = await raw
        .from('reading_sessions')
        .insert({ book_id: bookAId, minutes: 10, start_page: 10 });
      expect(error).not.toBeNull();
    });

    it('start > end 면 거부된다(page_range)', async () => {
      const raw = await rawClientA();
      const { error } = await raw
        .from('reading_sessions')
        .insert({ book_id: bookAId, minutes: 10, start_page: 40, end_page: 10 });
      expect(error).not.toBeNull();
    });

    it('타인 user_id 로의 삽입은 RLS insert with check 로 거부된다', async () => {
      const raw = await rawClientA();
      const { error } = await raw
        .from('reading_sessions')
        .insert({ book_id: bookAId, minutes: 10, user_id: userBId });
      expect(error).not.toBeNull();
    });
  });
});
