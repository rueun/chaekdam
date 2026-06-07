import { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';

export interface AddBookToShelfCommand {
  title: string;
  author?: string;
  /** 담을 책장(기본 WISH — 읽고 싶은) */
  status?: BookStatus;
  coverColor?: string | null;
}

export interface AddBookToShelfResult {
  bookId: string;
}

/**
 * 책을 책장에 담는다 — 입력을 도메인 Book 으로 만들고(불변식 강제) 저장한다.
 * 트랜잭션 경계 = Book Aggregate 1개. Port 만 의존.
 */
export class AddBookToShelfUseCase {
  constructor(private readonly books: BookRepository) {}

  async execute(command: AddBookToShelfCommand): Promise<AddBookToShelfResult> {
    const book = Book.register(command);
    await this.books.save(book);
    return { bookId: book.id };
  }
}
