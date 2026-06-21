import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { loadOwnedBook } from './book-ownership';

/**
 * 책을 책장에서 제거한다(위시에서 빼기 등). 소유권 검증(ADR-027): 없으면 NotFound,
 * 타인 책이면 AccessDenied. 연결된 한 줄은 DB FK(on delete cascade)로 함께 정리된다.
 */
export class RemoveBookFromShelfUseCase {
  constructor(private readonly books: BookRepository) {}

  async execute(bookId: string, userId: string): Promise<void> {
    await loadOwnedBook(this.books, bookId, userId);
    await this.books.remove(bookId);
  }
}
