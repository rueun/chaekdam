import { describe, it, expect } from 'vitest';
import { RemoveBookFromShelfUseCase } from './remove-book-from-shelf.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { Book } from '@/lib/domain/book/book';
import { BookAccessDeniedError, BookNotFoundError } from '@/lib/domain/shared/errors';

describe('RemoveBookFromShelfUseCase', () => {
  it('책을 책장에서 제거한다', async () => {
    const repo = new InMemoryBookRepository();
    const book = Book.register({ ownerId: 'owner', title: '데미안' });
    await repo.save(book);

    await new RemoveBookFromShelfUseCase(repo).execute(book.id, 'owner');

    expect(await repo.findById(book.id)).toBeNull();
  });

  it('없는 책 제거는 NotFound 로 막는다(ADR-027)', async () => {
    const repo = new InMemoryBookRepository();
    await expect(new RemoveBookFromShelfUseCase(repo).execute('nope', 'owner')).rejects.toThrow(
      BookNotFoundError,
    );
  });

  it('타인의 책은 제거할 수 없다(ADR-027)', async () => {
    const repo = new InMemoryBookRepository();
    const book = Book.register({ ownerId: 'owner', title: '데미안' });
    await repo.save(book);

    await expect(new RemoveBookFromShelfUseCase(repo).execute(book.id, 'intruder')).rejects.toThrow(
      BookAccessDeniedError,
    );
    expect(await repo.findById(book.id)).not.toBeNull(); // 제거되지 않음
  });
});
