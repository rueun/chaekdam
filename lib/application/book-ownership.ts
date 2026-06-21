import type { Book } from '@/lib/domain/book/book';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { OwnedBy } from '@/lib/domain/book/specs/owned-by';
import { BookAccessDeniedError, BookNotFoundError } from '@/lib/domain/shared/errors';

/**
 * 책을 불러오며 소유권을 검증한다(ADR-004/027 — 권한 이중 방어).
 * 없으면 NotFound, 소유자가 아니면 AccessDenied. mutate 유스케이스 공용.
 */
export async function loadOwnedBook(
  books: BookRepository,
  bookId: string,
  userId: string,
): Promise<Book> {
  const book = await books.findById(bookId);
  if (!book) throw new BookNotFoundError(bookId);
  if (!new OwnedBy(userId).isSatisfiedBy(book)) {
    throw new BookAccessDeniedError(bookId);
  }
  return book;
}
