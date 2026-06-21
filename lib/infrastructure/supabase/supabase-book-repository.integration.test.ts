// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { createSupabaseAdminClient } from './admin-client';
import { supabaseEnv } from './env';
import { SupabaseBookRepository } from './supabase-book-repository';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { Book } from '@/lib/domain/book/book';
import { BookStatus } from '@/lib/domain/book/book-status';

// 로컬 Supabase(`supabase start`) 필요. 실제 RLS 까지 검증(Mock 금지).

async function signInClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = supabaseEnv();
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe('SupabaseBookRepository (통합)', () => {
  const admin = createSupabaseAdminClient();
  const password = 'test-password-12345';
  const emailA = `book-a-${crypto.randomUUID()}@test.local`;
  const emailB = `book-b-${crypto.randomUUID()}@test.local`;
  let userAId: string;
  let userBId: string;
  let repoA: BookRepository;
  let repoB: BookRepository;

  beforeAll(async () => {
    const a = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    if (a.error) throw a.error;
    userAId = a.data.user.id;
    const b = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    if (b.error) throw b.error;
    userBId = b.data.user.id;
    repoA = new SupabaseBookRepository(await signInClient(emailA, password));
    repoB = new SupabaseBookRepository(await signInClient(emailB, password));
  });

  afterAll(async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it('책을 담고 id 로 조회한다', async () => {
    const book = Book.register({
      ownerId: userAId,
      title: '데미안',
      author: '헤르만 헤세',
      status: BookStatus.READING,
      coverColor: 'var(--clay-500)',
    });
    await repoA.save(book);

    const found = await repoA.findById(book.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe('데미안');
    expect(found!.author).toBe('헤르만 헤세');
    expect(found!.status).toBe(BookStatus.READING);
    expect(found!.coverColor).toBe('var(--clay-500)');
  });

  it('상태 전이를 save 로 반영하고, 표지 미지정은 null 로 왕복한다', async () => {
    const wish = Book.register({
      ownerId: userAId,
      title: `여행의 이유 ${crypto.randomUUID()}`,
      status: BookStatus.WISH,
    });
    await repoA.save(wish);
    await repoA.save(wish.withStatus(BookStatus.READING));

    const found = await repoA.findById(wish.id);
    expect(found!.status).toBe(BookStatus.READING); // update 반영
    expect(found!.title).toBe(wish.title); // 다른 필드 보존
    expect(found!.coverColor).toBeNull(); // 미지정 표지는 null
  });

  it('상태로 책장을 조회한다', async () => {
    const title = `완독본 ${crypto.randomUUID()}`;
    await repoA.save(Book.register({ ownerId: userAId, title, status: BookStatus.DONE }));

    const done = await repoA.findByStatus(userAId, BookStatus.DONE);
    expect(done.some((b) => b.title === title)).toBe(true);
    expect(done.every((b) => b.status === BookStatus.DONE)).toBe(true);
  });

  it('RLS — 다른 사용자의 책장은 보이지 않는다', async () => {
    const titleA = `A 책 ${crypto.randomUUID()}`;
    const titleB = `B 책 ${crypto.randomUUID()}`;
    await repoA.save(Book.register({ ownerId: userAId, title: titleA }));
    await repoB.save(Book.register({ ownerId: userBId, title: titleB }));

    const allA = await repoA.findAll(userAId);
    expect(allA.some((b) => b.title === titleA)).toBe(true);
    expect(allA.some((b) => b.title === titleB)).toBe(false);

    const allB = await repoB.findAll(userBId);
    expect(allB.some((b) => b.title === titleB)).toBe(true);
    expect(allB.some((b) => b.title === titleA)).toBe(false);
  });

  it('RLS with check — 타인 user_id 로는 책을 담을 수 없다(ADR-027)', async () => {
    // B 권한 클라이언트로 ownerId=userAId 위조 저장 시도 → insert with check(auth.uid()=user_id) 거부.
    const forged = Book.register({ ownerId: userAId, title: `위조 ${crypto.randomUUID()}` });
    await expect(repoB.save(forged)).rejects.toThrow();
  });

  it('책을 제거한다 — 다른 사용자 책은 RLS 로 제거되지 않는다', async () => {
    const mine = Book.register({ ownerId: userAId, title: `삭제 대상 ${crypto.randomUUID()}` });
    await repoA.save(mine);
    await repoA.remove(mine.id, userAId);
    expect(await repoA.findById(mine.id)).toBeNull();

    // B 가 A 의 책 제거를 시도해도 RLS 로 매칭 0건 → A 의 책은 그대로
    const aBook = Book.register({ ownerId: userAId, title: `A 전용 ${crypto.randomUUID()}` });
    await repoA.save(aBook);
    await repoB.remove(aBook.id, userBId);
    expect(await repoA.findById(aBook.id)).not.toBeNull();
  });
});
