import type { SupabaseClient } from '@supabase/supabase-js';
import { Discussion } from '@/lib/domain/discussion/discussion';
import { Message } from '@/lib/domain/discussion/message';
import { Role } from '@/lib/domain/discussion/role';
import type { PersonaKey } from '@/lib/domain/persona/persona';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import type { Database } from './types.gen';

type DiscussionRow = Database['public']['Tables']['discussions']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

/** findAll 방어적 상한 — 페이지네이션 도입 전 무한정 조회 방지 */
const DISCUSSIONS_LIST_LIMIT = 200;

/**
 * DiscussionRepository 의 Supabase 어댑터.
 * 주입된 클라이언트의 사용자 권한으로 실행되며, user_id 는 DB default(auth.uid())+RLS 로
 * 채워지고 보호된다. row(snake_case) ↔ 도메인 Discussion/Message 매핑은 이 어댑터 책임.
 */
export class SupabaseDiscussionRepository implements DiscussionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(discussion: Discussion): Promise<void> {
    // 방을 먼저 upsert(메시지 FK 충족). user_id 는 도메인 ownerId 를 권위 있는 값으로 명시(ADR-027).
    // RLS with check(auth.uid()=user_id) 가 타인 값 위조를 DB 에서 차단해 이중 방어가 된다.
    const { error: roomError } = await this.client.from('discussions').upsert(
      {
        id: discussion.id,
        user_id: discussion.ownerId,
        book_id: discussion.bookId,
        persona_key: discussion.personaKey,
        seed_highlight_id: discussion.seedHighlightId,
        title: discussion.title,
      },
      { onConflict: 'id' },
    );
    if (roomError) throw new Error(`Failed to save discussion: ${roomError.message}`);

    if (discussion.messages.length === 0) return;
    // 메시지는 불변 + 고유 id — id 충돌은 무시(insert-or-skip)해 기존 발화 재기록을 피한다.
    // user_id 는 방과 같은 소유자(비정규화). TODO(perf): 재저장 시 전체 메시지를 페이로드로 보낸다
    // (DB 쓰기는 skip). 대화가 길어지면 Port 에 appendMessages(신규만) 분리를 검토(현재 MVP 무방).
    const { error: msgError } = await this.client.from('messages').upsert(
      discussion.messages.map((m) => ({
        id: m.id,
        user_id: discussion.ownerId,
        discussion_id: m.discussionId,
        role: m.role,
        content: m.content,
        created_at: m.createdAt.toISOString(),
      })),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (msgError) throw new Error(`Failed to save messages: ${msgError.message}`);
  }

  async findById(id: string): Promise<Discussion | null> {
    const { data: room, error } = await this.client
      .from('discussions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to find discussion: ${error.message}`);
    if (!room) return null;

    const { data: messages, error: msgError } = await this.client
      .from('messages')
      .select('*')
      .eq('discussion_id', id)
      .order('created_at', { ascending: true });
    if (msgError) throw new Error(`Failed to load messages: ${msgError.message}`);

    return toDomain(room, messages ?? []);
  }

  async findAll(userId: string): Promise<Discussion[]> {
    // user_id 명시 필터(ADR-027) — RLS(1차)와 이중 방어. 방을 최신순으로 가져온 뒤
    // 메시지를 한 번에 조회해 그룹핑(2 쿼리).
    const { data: rooms, error } = await this.client
      .from('discussions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(DISCUSSIONS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list discussions: ${error.message}`);
    if (!rooms || rooms.length === 0) return [];

    const { data: messages, error: msgError } = await this.client
      .from('messages')
      .select('*')
      .in(
        'discussion_id',
        rooms.map((r) => r.id),
      )
      .order('created_at', { ascending: true });
    if (msgError) throw new Error(`Failed to load messages: ${msgError.message}`);

    const byDiscussion = new Map<string, MessageRow[]>();
    for (const m of messages ?? []) {
      const list = byDiscussion.get(m.discussion_id) ?? [];
      list.push(m);
      byDiscussion.set(m.discussion_id, list);
    }
    return rooms.map((room) => toDomain(room, byDiscussion.get(room.id) ?? []));
  }
}

/** Supabase row 묶음을 도메인 Discussion 으로 복원한다. */
function toDomain(room: DiscussionRow, messageRows: MessageRow[]): Discussion {
  return Discussion.restore({
    id: room.id,
    ownerId: room.user_id,
    bookId: room.book_id,
    personaKey: toPersonaKey(room.persona_key),
    seedHighlightId: room.seed_highlight_id,
    title: room.title,
    messages: messageRows.map((m) =>
      Message.restore({
        id: m.id,
        discussionId: m.discussion_id,
        role: toRole(m.role),
        content: m.content,
        createdAt: new Date(m.created_at),
      }),
    ),
    createdAt: new Date(room.created_at),
  });
}

/** DB text → 도메인 PersonaKey. DB check 제약과 일치하지 않으면 데이터 오염이므로 즉시 실패. */
function toPersonaKey(value: string): PersonaKey {
  switch (value) {
    case 'socrates':
    case 'critic':
    case 'author':
    case 'friend':
      return value;
    default:
      throw new Error(`Unknown persona_key from DB: ${value}`);
  }
}

/** DB text → 도메인 Role. */
function toRole(value: string): Role {
  switch (value) {
    case 'USER':
      return Role.USER;
    case 'AI':
      return Role.AI;
    default:
      throw new Error(`Unknown message role from DB: ${value}`);
  }
}
