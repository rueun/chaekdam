import type { SupabaseClient } from '@supabase/supabase-js';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { HighlightPage, HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { Database } from './types.gen';

type HighlightRow = Database['public']['Tables']['highlights']['Row'];
type DbNoteSource = Database['public']['Enums']['note_source'];

/** 한 페이지 최대 개수 — 한 번에 가져올 상한(무한정 스캔 방지). */
const HIGHLIGHTS_LIST_LIMIT = 200;

/** 페이지 옵션을 안전한 offset/limit 으로 정규화(음수·과대 방지). */
function pageBounds(page?: HighlightPage): { offset: number; limit: number } {
  const offset = Math.max(0, Math.trunc(page?.offset ?? 0));
  const limit = Math.min(
    HIGHLIGHTS_LIST_LIMIT,
    Math.max(1, Math.trunc(page?.limit ?? HIGHLIGHTS_LIST_LIMIT)),
  );
  return { offset, limit };
}

/**
 * HighlightRepository 의 Supabase 어댑터.
 * 주입된 클라이언트의 사용자 권한으로 실행되며, user_id 는 DB default(auth.uid())+RLS 로
 * 채워지고 보호된다. row(snake_case) ↔ 도메인 Highlight 매핑은 이 어댑터 책임.
 */
export class SupabaseHighlightRepository implements HighlightRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(highlight: Highlight): Promise<void> {
    // upsert — 신규 캡처는 삽입, 수정(같은 id 재저장)은 갱신. 한 줄은 불변이라 항상 전체 필드를 다시 쓴다.
    // user_id 는 도메인 ownerId 를 권위 있는 값으로 명시(ADR-027). RLS insert/update
    // with check(auth.uid()=user_id) 가 타인 값 위조를 DB 에서 차단해 이중 방어가 된다.
    const { error } = await this.client.from('highlights').upsert(
      {
        id: highlight.id,
        user_id: highlight.ownerId,
        book_id: highlight.bookId,
        source: highlight.source,
        content: highlight.content,
        photo_url: highlight.photoUrl,
        page: highlight.page,
        pinned: highlight.pinned,
        archived: highlight.archived,
        tags: [...highlight.tags],
      },
      { onConflict: 'id' }, // 충돌 기준을 PK 로 명시(PostgREST 기본값 의존 제거)
    );
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

  async findByBookId(userId: string, bookId: string): Promise<Highlight[]> {
    // user_id 명시 필터(ADR-027) — RLS(1차)와 이중 방어. 백엔드 분리 시에도 소유 범위 유지.
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to list highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findAll(userId: string, page?: HighlightPage): Promise<Highlight[]> {
    // user_id 명시 필터(ADR-027, RLS 와 이중 방어). 보관 제외 + 고정 우선, 그 안에서 최신순(ADR-021).
    // 페이지(ADR-025) — '더보기' 로 offset 만큼 건너뛰고 limit 개. 미지정 시 기본 상한.
    const { offset, limit } = pageBounds(page);
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(`Failed to list highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findArchived(userId: string, page?: HighlightPage): Promise<Highlight[]> {
    // 보관함 — user_id 명시 필터(ADR-027) + archived = true 만 최신순.
    const { offset, limit } = pageBounds(page);
    const { data, error } = await this.client
      .from('highlights')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(`Failed to list archived highlights: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async remove(id: string, userId: string): Promise<void> {
    // id + user_id 명시 매칭(ADR-027) — RLS 와 이중 방어. 타인 한 줄은 매칭 0건.
    const { error } = await this.client
      .from('highlights')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(`Failed to delete highlight: ${error.message}`);
  }
}

/** Supabase row 를 도메인 Highlight 로 복원한다. */
function toDomain(row: HighlightRow): Highlight {
  return Highlight.restore({
    id: row.id,
    ownerId: row.user_id,
    bookId: row.book_id,
    source: toNoteSource(row.source),
    content: row.content,
    photoUrl: row.photo_url,
    page: row.page,
    createdAt: new Date(row.created_at),
    pinned: row.pinned,
    archived: row.archived,
    tags: row.tags,
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
