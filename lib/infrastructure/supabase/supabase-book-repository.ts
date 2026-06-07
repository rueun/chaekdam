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
    // payload 에 user_id·created_at 을 넣지 않는다: insert 시 DB default(auth.uid()/now()),
    // update 시 PostgREST 가 payload 컬럼만 SET 하므로 기존 값이 보존된다(RLS 가 본인 행만 허용).
    const { error } = await this.client.from('books').upsert(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        cover_color: book.coverColor,
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

  async findAll(): Promise<Book[]> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(BOOKS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list books: ${error.message}`);
    return (data ?? []).map(toDomain);
  }

  async findByStatus(status: BookStatus): Promise<Book[]> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(BOOKS_LIST_LIMIT);
    if (error) throw new Error(`Failed to list books: ${error.message}`);
    return (data ?? []).map(toDomain);
  }
}

/** Supabase row 를 도메인 Book 으로 복원한다. */
function toDomain(row: BookRow): Book {
  return Book.restore({
    id: row.id,
    title: row.title,
    author: row.author,
    status: toBookStatus(row.status),
    coverColor: row.cover_color,
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
