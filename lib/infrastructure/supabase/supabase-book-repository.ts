import type { SupabaseClient } from '@supabase/supabase-js';
import { Book } from '@/lib/domain/book/book';
import { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import type { Database } from './types.gen';

type BookRow = Database['public']['Tables']['books']['Row'];
type DbBookStatus = Database['public']['Enums']['book_status'];

/** 목록 조회 방어적 상한 — 페이지네이션 도입 전 무한정 조회 방지 */
const BOOKS_LIST_LIMIT = 500;

/**
 * BookRepository 의 Supabase 어댑터.
 * 주입된 사용자 권한 클라이언트로 실행되며 user_id 는 DB default(auth.uid())+RLS 로 보호.
 * row(snake_case) ↔ 도메인 Book 매핑은 이 어댑터 책임.
 */
export class SupabaseBookRepository implements BookRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(book: Book): Promise<void> {
    // Book 은 가변(상태 전이) — 신규 insert / 기존 update 를 upsert(PK id 충돌) 로 처리.
    // user_id 는 도메인 ownerId 를 권위 있는 값으로 명시(ADR-027). RLS with check(auth.uid()=user_id)
    // 가 타인 값 위조를 DB 에서 차단해 이중 방어가 된다. created_at 은 payload 에 없어 DB default 보존.
    const { error } = await this.client.from('books').upsert(
      {
        id: book.id,
        user_id: book.ownerId,
        title: book.title,
        author: book.author,
        status: book.status,
        cover_color: book.coverColor,
        cover_image_url: book.coverImageUrl,
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(`Failed to save book: ${error.message}`);
  }

  async findById(id: string): Promise<Book | null> {
    const { data, error } = await this.client.from('books').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Failed to find book: ${error.message}`);
    return data ? toDomain(data) : null;
  }

  async findAll(userId: string): Promise<Book[]> {
    // user_id 명시 필터(ADR-027) — RLS(1차)와 이중 방어.
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(BOOKS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list books: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findByStatus(userId: string, status: BookStatus): Promise<Book[]> {
    // user_id 명시 필터(ADR-027) — RLS(1차)와 이중 방어.
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(BOOKS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list books: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async remove(id: string, userId: string): Promise<void> {
    // id + user_id 명시 매칭(ADR-027) — RLS 와 이중 방어. 타인 책은 매칭 0건.
    const { error } = await this.client.from('books').delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to remove book: ${error.message}`);
  }
}

/** Supabase row 를 도메인 Book 으로 복원한다. */
function toDomain(row: BookRow): Book {
  return Book.restore({
    id: row.id,
    ownerId: row.user_id,
    title: row.title,
    author: row.author,
    status: toBookStatus(row.status),
    coverColor: row.cover_color,
    coverImageUrl: row.cover_image_url,
    createdAt: new Date(row.created_at),
  });
}

/** DB enum(book_status) → 도메인 VO 명시 변환(값 변경 시 컴파일 에러로 누락 포착). */
function toBookStatus(value: DbBookStatus): BookStatus {
  switch (value) {
    case 'READING':
      return BookStatus.READING;
    case 'DONE':
      return BookStatus.DONE;
    case 'WISH':
      return BookStatus.WISH;
    case 'PAUSED':
      return BookStatus.PAUSED;
    default:
      // types.gen 재생성 누락 등으로 알 수 없는 값이 오면 빠르게 실패
      throw new Error(`Unknown book_status: ${value as string}`);
  }
}
