import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { BookNotFoundError } from '@/lib/domain/shared/errors';

export interface SetBookStatusCommand {
  bookId: string;
  status: BookStatus;
}

/**
 * 책장 이동 — 책을 찾아 상태를 바꾼(새 객체) 뒤 저장한다.
 * 읽고 싶은 → 읽는 중 → 완독 등. 없는 책이면 도메인 예외.
 */
export class SetBookStatusUseCase {
  constructor(private readonly books: BookRepository) {}

  async execute({ bookId, status }: SetBookStatusCommand): Promise<void> {
    const book = await this.books.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);
    await this.books.save(book.withStatus(status));
  }
}
