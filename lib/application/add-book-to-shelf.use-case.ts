import { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';

export interface AddBookToShelfCommand {
  /** 책장 주인(소유자) — 서버 세션에서 주입(ADR-027) */
  userId: string;
  title: string;
  author?: string;
  /** 담을 책장(기본 WISH — 읽고 싶은) */
  status?: BookStatus;
  coverColor?: string | null;
  /** 표지 이미지 URL(도서 API 썸네일) */
  coverImageUrl?: string | null;
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
    const book = Book.register({
      ownerId: command.userId,
      title: command.title,
      author: command.author,
      status: command.status,
      coverColor: command.coverColor,
      coverImageUrl: command.coverImageUrl,
    });
    await this.books.save(book);
    return { bookId: book.id };
  }
}
