import type { SupabaseClient } from '@supabase/supabase-js';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { Database } from './types.gen';

type HighlightRow = Database['public']['Tables']['highlights']['Row'];
type DbNoteSource = Database['public']['Enums']['note_source'];

/**
 * HighlightRepository 의 Supabase 어댑터.
 * 주입된 클라이언트의 사용자 권한으로 실행되며, user_id 는 DB default(auth.uid())+RLS 로
 * 채워지고 보호된다. row(snake_case) ↔ 도메인 Highlight 매핑은 이 어댑터 책임.
 */
export class SupabaseHighlightRepository implements HighlightRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(highlight: Highlight): Promise<void> {
    // 한 줄은 불변 — 캡처는 신규 생성. user_id 는 DB default auth.uid() 가 채운다(RLS).
    const { error } = await this.client.from('highlights').insert({
      id: highlight.id,
      book_id: highlight.bookId,
      source: highlight.source,
      content: highlight.content,
      photo_url: highlight.photoUrl,
      page: highlight.page,
    });
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
