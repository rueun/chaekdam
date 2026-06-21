import { describe, it, expect, beforeEach } from 'vitest';
import { ListBooksUseCase } from './list-books.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { Book } from '@/lib/domain/book/book';
import { BookStatus } from '@/lib/domain/book/book-status';

describe('ListBooksUseCase', () => {
  let repo: InMemoryBookRepository;

  beforeEach(async () => {
    repo = new InMemoryBookRepository();
    await repo.save(
      Book.register({ ownerId: 'owner', title: '읽는 중 책', status: BookStatus.READING }),
    );
    await repo.save(Book.register({ ownerId: 'owner', title: '완독 책', status: BookStatus.DONE }));
    await repo.save(Book.register({ ownerId: 'owner', title: '위시 책', status: BookStatus.WISH }));
    await repo.save(
      Book.register({ ownerId: 'owner', title: '쉬는 중 책', status: BookStatus.PAUSED }),
    );
  });

  it('빈 책장은 빈 목록을 돌려준다', async () => {
    const empty = await new ListBooksUseCase(new InMemoryBookRepository()).execute('owner');
    expect(empty).toEqual([]);
  });

  it('상태 미지정 시 전체를 돌려준다', async () => {
    const all = await new ListBooksUseCase(repo).execute('owner');
    expect(all).toHaveLength(4);
  });

  it('상태를 주면 해당 책장만 돌려준다(다른 상태 미포함)', async () => {
    const reading = await new ListBooksUseCase(repo).execute('owner', BookStatus.READING);
    expect(reading).toHaveLength(1);
    expect(reading[0]!.title).toBe('읽는 중 책');

    const paused = await new ListBooksUseCase(repo).execute('owner', BookStatus.PAUSED);
    expect(paused.map((b) => b.title)).toEqual(['쉬는 중 책']);
  });

  it('타인의 책은 책장에 섞이지 않는다(ADR-027, RLS 없이도 소유 범위)', async () => {
    await repo.save(Book.register({ ownerId: 'intruder', title: '남의 책' }));
    const mine = await new ListBooksUseCase(repo).execute('owner');
    expect(mine).toHaveLength(4); // intruder 책 제외
    expect(mine.every((b) => b.ownerId === 'owner')).toBe(true);
  });
});
