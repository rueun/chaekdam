import type { BookRepository } from '@/lib/domain/ports/book-repository';

/**
 * 책을 책장에서 제거한다(위시에서 빼기 등). 소유 검증은 Repository/RLS 가 보장.
 * 연결된 한 줄은 DB FK(on delete cascade)로 함께 정리된다.
 */
export class RemoveBookFromShelfUseCase {
  constructor(private readonly books: BookRepository) {}

  execute(bookId: string): Promise<void> {
    return this.books.remove(bookId);
  }
}
