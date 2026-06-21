import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { loadOwnedBook } from './book-ownership';

export interface SetBookStatusCommand {
  bookId: string;
  userId: string;
  status: BookStatus;
}

/**
 * 책장 이동 — 책을 찾아 상태를 바꾼(새 객체) 뒤 저장한다.
 * 읽고 싶은 → 읽는 중 → 완독 등. 소유권 검증(ADR-027): 없으면 NotFound, 타인 책이면 AccessDenied.
 */
export class SetBookStatusUseCase {
  constructor(private readonly books: BookRepository) {}

  async execute({ bookId, userId, status }: SetBookStatusCommand): Promise<void> {
    const book = await loadOwnedBook(this.books, bookId, userId);
    await this.books.save(book.withStatus(status));
  }
}
