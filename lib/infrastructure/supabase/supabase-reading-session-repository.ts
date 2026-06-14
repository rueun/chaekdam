import type { SupabaseClient } from '@supabase/supabase-js';
import { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';
import type { Database } from './types.gen';

type ReadingSessionRow = Database['public']['Tables']['reading_sessions']['Row'];

/** findAll 방어적 상한 — 페이지네이션/기간 필터 도입 전 무한정 조회 방지 */
const READING_SESSIONS_LIST_LIMIT = 1000;

/**
 * ReadingSessionRepository 의 Supabase 어댑터.
 * 주입된 클라이언트의 사용자 권한으로 실행되며, user_id 는 DB default(auth.uid())+RLS 로
 * 채워지고 보호된다. row(snake_case) ↔ 도메인 ReadingSession 매핑은 이 어댑터 책임.
 */
export class SupabaseReadingSessionRepository implements ReadingSessionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(session: ReadingSession): Promise<void> {
    // 세션은 불변 기록 — 항상 신규 삽입. user_id 는 DB default auth.uid() 가 채운다(RLS).
    const { error } = await this.client.from('reading_sessions').insert({
      id: session.id,
      book_id: session.bookId,
      minutes: session.minutes,
      start_page: session.startPage,
      end_page: session.endPage,
      occurred_at: session.occurredAt.toISOString(),
    });
    if (error) throw new Error(`Failed to save reading session: ${error.message}`);
  }

  async findAll(): Promise<ReadingSession[]> {
    // RLS 가 본인 행으로 한정한다 — 별도 user_id 필터 불필요.
    const { data, error } = await this.client
      .from('reading_sessions')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(READING_SESSIONS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list reading sessions: ${error.message}`);
    return (data ?? []).map(toDomain);
  }
}

/** Supabase row 를 도메인 ReadingSession 으로 복원한다. */
function toDomain(row: ReadingSessionRow): ReadingSession {
  return ReadingSession.restore({
    id: row.id,
    bookId: row.book_id,
    minutes: row.minutes,
    startPage: row.start_page,
    endPage: row.end_page,
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
  });
}
