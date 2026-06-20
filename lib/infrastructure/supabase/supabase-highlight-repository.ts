import type { SupabaseClient } from '@supabase/supabase-js';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { Database } from './types.gen';

type HighlightRow = Database['public']['Tables']['highlights']['Row'];
type DbNoteSource = Database['public']['Enums']['note_source'];

/** findAll 방어적 상한 — 페이지네이션 도입 전 무한정 조회 방지 */
const HIGHLIGHTS_LIST_LIMIT = 200;

/**
 * HighlightRepository 의 Supabase 어댑터.
 * 주입된 클라이언트의 사용자 권한으로 실행되며, user_id 는 DB default(auth.uid())+RLS 로
 * 채워지고 보호된다. row(snake_case) ↔ 도메인 Highlight 매핑은 이 어댑터 책임.
 */
export class SupabaseHighlightRepository implements HighlightRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(highlight: Highlight): Promise<void> {
    // upsert — 신규 캡처는 삽입, 수정(같은 id 재저장)은 갱신. user_id 는 DB default auth.uid() 가
    // 채우고 RLS(insert/update 본인) 가 보호한다. 한 줄은 불변이라 항상 전체 필드를 다시 쓴다.
    const { error } = await this.client.from('highlights').upsert(
      {
        id: highlight.id,
        book_id: highlight.bookId,
        source: highlight.source,
        content: highlight.content,
        photo_url: highlight.photoUrl,
        page: highlight.page,
        pinned: highlight.pinned,
        archived: highlight.archived,
      },
      { onConflict: 'id' }, // 충돌 기준을 PK 로 명시(PostgREST 기본값 의존 제거)
    );
    // user_id 는 payload 에 없어 INSERT 는 default auth.uid(), UPDATE 는 기존 값 유지.
    // 타인 행 변조는 RLS update with check(auth.uid()=user_id) 가 차단한다.
    if (error) throw new Error(`Failed to save highlight: ${error.message}`);
  }

  async findById(id: string): Promise<Highlight | null> {
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to find highlight: ${error.message}`);
    return data ? toDomain(data) : null;
  }

  async findByBookId(bookId: string): Promise<Highlight[]> {
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to list highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findAll(): Promise<Highlight[]> {
    // RLS 가 본인 행으로 한정. 보관 제외 + 고정 우선, 그 안에서 최신순(ADR-021).
    // 방어적 상한(무한정 스캔 방지). 본격 페이지네이션은 후속.
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('archived', false)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(HIGHLIGHTS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findArchived(): Promise<Highlight[]> {
    // 보관함 — archived = true 만 최신순.
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('archived', true)
      .order('created_at', { ascending: false })
      .limit(HIGHLIGHTS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list archived highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async remove(id: string): Promise<void> {
    // RLS 가 본인 행만 매칭한다 — 타인 한 줄은 매칭 0건이라 영향 없음.
    const { error } = await this.client.from('highlights').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete highlight: ${error.message}`);
  }
}

/** Supabase row 를 도메인 Highlight 로 복원한다. */
function toDomain(row: HighlightRow): Highlight {
  return Highlight.restore({
    id: row.id,
    bookId: row.book_id,
    source: toNoteSource(row.source),
    content: row.content,
    photoUrl: row.photo_url,
    page: row.page,
    createdAt: new Date(row.created_at),
    pinned: row.pinned,
    archived: row.archived,
  });
}

/**
 * DB enum(note_source) → 도메인 VO(NoteSource) 명시 변환.
 * 값이 추가/변경되면 이 지점에서 컴파일 에러로 매핑 누락을 잡는다(타입 경계 고정).
 */
function toNoteSource(value: DbNoteSource): NoteSource {
  switch (value) {
    case 'PHOTO':
      return NoteSource.PHOTO;
    case 'TEXT':
      return NoteSource.TEXT;
  }
}
