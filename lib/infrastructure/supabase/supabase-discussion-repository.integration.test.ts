// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { createSupabaseAdminClient } from './admin-client';
import { supabaseEnv } from './env';
import { SupabaseDiscussionRepository } from './supabase-discussion-repository';
import { SupabaseBookRepository } from './supabase-book-repository';
import { SupabaseHighlightRepository } from './supabase-highlight-repository';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import { Discussion } from '@/lib/domain/discussion/discussion';
import { Book } from '@/lib/domain/book/book';
import { Highlight } from '@/lib/domain/highlight/highlight';

// 로컬 Supabase 필요. 실제 RLS·FK·cascade 까지 검증(Mock 금지).

async function signInClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = supabaseEnv();
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe('SupabaseDiscussionRepository (통합)', () => {
  const admin = createSupabaseAdminClient();
  const password = 'test-password-12345';
  const emailA = `disc-a-${crypto.randomUUID()}@test.local`;
  const emailB = `disc-b-${crypto.randomUUID()}@test.local`;
  let userAId: string;
  let userBId: string;
  let repoA: DiscussionRepository;
  let repoB: DiscussionRepository;
  let bookAId: string;
  let bookBId: string;
  let seedHighlightId: string;

  beforeAll(async () => {
    const a = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    if (a.error) throw a.error;
    userAId = a.data.user.id;
    const b = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    if (b.error) throw b.error;
    userBId = b.data.user.id;

    const clientA = await signInClient(emailA, password);
    const clientB = await signInClient(emailB, password);
    repoA = new SupabaseDiscussionRepository(clientA);
    repoB = new SupabaseDiscussionRepository(clientB);

    const bookA = Book.register({
      ownerId: userAId,
      title: `토론 책 A ${crypto.randomUUID()}`,
      author: '헤르만 헤세',
    });
    const bookB = Book.register({ ownerId: userBId, title: `토론 책 B ${crypto.randomUUID()}` });
    await new SupabaseBookRepository(clientA).save(bookA);
    await new SupabaseBookRepository(clientB).save(bookB);
    bookAId = bookA.id;
    bookBId = bookB.id;

    const seed = Highlight.fromText(userAId, bookAId, '새는 알에서 나오려고 투쟁한다');
    await new SupabaseHighlightRepository(clientA).save(seed);
    seedHighlightId = seed.id;
  });

  afterAll(async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it('토론을 메시지·시드와 함께 저장하고 조회한다', async () => {
    const room = Discussion.start({
      ownerId: userAId,
      bookId: bookAId,
      personaKey: 'socrates',
      seedHighlightId,
      title: Discussion.titleFromSeed('새는 알에서 나오려고 투쟁한다'),
    })
      .addAiMessage('이 문장을 따라 적은 이유는 무엇이었을까요?')
      .addUserMessage('두려움과 기대가 같이 느껴졌어요');
    await repoA.save(room);

    const found = await repoA.findById(room.id);
    expect(found).not.toBeNull();
    expect(found!.ownerId).toBe(userAId); // user_id ↔ ownerId 왕복(ADR-027)
    expect(found!.bookId).toBe(bookAId);
    expect(found!.personaKey).toBe('socrates');
    expect(found!.seedHighlightId).toBe(seedHighlightId);
    expect(found!.title).toContain('새는 알에서');
    expect(found!.messageCount).toBe(2);
    // 시간순(작성 순서) 보존
    expect(found!.messages[0]!.role).toBe('AI');
    expect(found!.messages[1]!.role).toBe('USER');
    expect(found!.messages[1]!.content).toBe('두려움과 기대가 같이 느껴졌어요');
  });

  it('이어가기(재저장)는 기존 발화를 재기록하지 않고 새 발화만 더한다', async () => {
    const room = Discussion.start({
      ownerId: userAId,
      bookId: bookAId,
      personaKey: 'critic',
    }).addAiMessage('여는 말');
    await repoA.save(room);

    const continued = (await repoA.findById(room.id))!
      .addUserMessage('이어서 한마디')
      .addAiMessage('그 점을 더 들려주세요');
    await repoA.save(continued);

    const found = await repoA.findById(room.id);
    expect(found!.messageCount).toBe(3);
  });

  it('RLS — 다른 사용자의 토론은 보이지 않는다', async () => {
    const mine = Discussion.start({
      ownerId: userAId,
      bookId: bookAId,
      personaKey: 'friend',
    }).addAiMessage('A 의 방');
    await repoA.save(mine);
    const theirs = Discussion.start({
      ownerId: userBId,
      bookId: bookBId,
      personaKey: 'friend',
    }).addAiMessage('B 의 방');
    await repoB.save(theirs);

    const allB = await repoB.findAll(userBId);
    expect(allB.some((d) => d.id === theirs.id)).toBe(true);
    expect(allB.some((d) => d.id === mine.id)).toBe(false);
    // B 가 A 의 방을 직접 조회해도 RLS 로 막힌다
    expect(await repoB.findById(mine.id)).toBeNull();
  });

  it('책을 지우면 토론도 cascade 로 사라진다', async () => {
    const clientA = await signInClient(emailA, password);
    const book = Book.register({ ownerId: userAId, title: `삭제용 ${crypto.randomUUID()}` });
    await new SupabaseBookRepository(clientA).save(book);
    const room = Discussion.start({
      ownerId: userAId,
      bookId: book.id,
      personaKey: 'socrates',
    }).addAiMessage('방');
    await repoA.save(room);
    expect(await repoA.findById(room.id)).not.toBeNull();

    await new SupabaseBookRepository(clientA).remove(book.id);
    expect(await repoA.findById(room.id)).toBeNull();
  });

  it('없는 id 조회는 null', async () => {
    expect(await repoA.findById(crypto.randomUUID())).toBeNull();
  });

  it('DB check 제약 — 잘못된 role 은 거부된다(이중 방어)', async () => {
    const clientA = await signInClient(emailA, password);
    const room = Discussion.start({
      ownerId: userAId,
      bookId: bookAId,
      personaKey: 'socrates',
    }).addAiMessage('방');
    await repoA.save(room);
    const { error } = await clientA
      .from('messages')
      .insert({ discussion_id: room.id, role: 'SYSTEM', content: '잘못된 역할' });
    expect(error).not.toBeNull();
  });

  it('RLS — 타인 방에는 발화를 삽입할 수 없다', async () => {
    // A 의 방에 B 가 직접 메시지 insert 시도 → discussion 소유 검증으로 거부.
    const mine = Discussion.start({
      ownerId: userAId,
      bookId: bookAId,
      personaKey: 'socrates',
    }).addAiMessage('방');
    await repoA.save(mine);
    const clientB = await signInClient(emailB, password);
    const { error } = await clientB
      .from('messages')
      .insert({ discussion_id: mine.id, role: 'USER', content: '끼어들기' });
    expect(error).not.toBeNull();
  });

  it('persona_key=author 는 DB check 는 통과하되 도메인이 막는다(ADR-015 비대칭)', async () => {
    // DB 는 미래 대비로 4종 허용 — author 직접 insert 는 성공한다.
    const clientA = await signInClient(emailA, password);
    const { error } = await clientA
      .from('discussions')
      .insert({ book_id: bookAId, persona_key: 'author' });
    expect(error).toBeNull();
    // 그러나 도메인 경로(Discussion.start)는 author 를 거부한다(start-discussion.use-case.test 에서 검증).
  });
});
