import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';

/**
 * 책장 조회(Query) — 상태를 주면 해당 책장만, 없으면 전체. 최신순.
 * userId 소유 범위는 Repository 계약으로 명시(ADR-027) — RLS(1차)와 이중 방어.
 */
export class ListBooksUseCase {
  constructor(private readonly books: BookRepository) {}

  execute(userId: string, status?: BookStatus): Promise<Book[]> {
    return status ? this.books.findByStatus(userId, status) : this.books.findAll(userId);
  }
}
