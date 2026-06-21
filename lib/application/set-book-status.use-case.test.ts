import { describe, it, expect } from 'vitest';
import { SetBookStatusUseCase } from './set-book-status.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { Book } from '@/lib/domain/book/book';
import { BookStatus } from '@/lib/domain/book/book-status';
import { BookAccessDeniedError, BookNotFoundError } from '@/lib/domain/shared/errors';

describe('SetBookStatusUseCase', () => {
  it('책장 상태를 바꾼다(위시 → 읽는 중)', async () => {
    const repo = new InMemoryBookRepository();
    const book = Book.register({ ownerId: 'owner', title: '데미안', status: BookStatus.WISH });
    await repo.save(book);

    await new SetBookStatusUseCase(repo).execute({
      bookId: book.id,
      userId: 'owner',
      status: BookStatus.READING,
    });

    expect((await repo.findById(book.id))!.status).toBe(BookStatus.READING);
  });

  it('없는 책이면 도메인 예외를 던진다', async () => {
    const repo = new InMemoryBookRepository();
    await expect(
      new SetBookStatusUseCase(repo).execute({
        bookId: 'nope',
        userId: 'owner',
        status: BookStatus.DONE,
      }),
    ).rejects.toThrow(BookNotFoundError);
  });

  it('타인의 책은 상태를 바꿀 수 없다(ADR-027)', async () => {
    const repo = new InMemoryBookRepository();
    const book = Book.register({ ownerId: 'owner', title: '데미안', status: BookStatus.WISH });
    await repo.save(book);

    await expect(
      new SetBookStatusUseCase(repo).execute({
        bookId: book.id,
        userId: 'intruder',
        status: BookStatus.READING,
      }),
    ).rejects.toThrow(BookAccessDeniedError);
    expect((await repo.findById(book.id))!.status).toBe(BookStatus.WISH); // 변경되지 않음
  });
});
