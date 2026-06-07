import { describe, it, expect } from 'vitest';
import { RemoveBookFromShelfUseCase } from './remove-book-from-shelf.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { Book } from '@/lib/domain/book/book';

describe('RemoveBookFromShelfUseCase', () => {
  it('책을 책장에서 제거한다', async () => {
    const repo = new InMemoryBookRepository();
    const book = Book.register({ title: '데미안' });
    await repo.save(book);

    await new RemoveBookFromShelfUseCase(repo).execute(book.id);

    expect(await repo.findById(book.id)).toBeNull();
  });

  it('없는 책 제거는 조용히 통과한다', async () => {
    const repo = new InMemoryBookRepository();
    await expect(new RemoveBookFromShelfUseCase(repo).execute('nope')).resolves.toBeUndefined();
  });
});
