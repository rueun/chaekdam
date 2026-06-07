import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';

/**
 * 책장 조회(Query) — 상태를 주면 해당 책장만, 없으면 전체. 최신순.
 */
export class ListBooksUseCase {
  constructor(private readonly books: BookRepository) {}

  execute(status?: BookStatus): Promise<Book[]> {
    return status ? this.books.findByStatus(status) : this.books.findAll();
  }
}
