import { describe, it, expect } from 'vitest';
import { AddBookToShelfUseCase } from './add-book-to-shelf.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { BookStatus } from '@/lib/domain/book/book-status';
import { EmptyBookTitleError } from '@/lib/domain/shared/errors';

describe('AddBookToShelfUseCase', () => {
  it('책을 책장에 담고 id 를 돌려준다 — 기본 WISH', async () => {
    const repo = new InMemoryBookRepository();
    const { bookId } = await new AddBookToShelfUseCase(repo).execute({
      userId: 'owner',
      title: '데미안',
      author: '헤르만 헤세',
    });

    const saved = await repo.findById(bookId);
    expect(saved).not.toBeNull();
    expect(saved!.title).toBe('데미안');
    expect(saved!.status).toBe(BookStatus.WISH);
    expect(saved!.ownerId).toBe('owner'); // 세션 userId 가 소유자로 고정됨(ADR-027)
  });

  it('상태를 지정해 담을 수 있다', async () => {
    const repo = new InMemoryBookRepository();
    const { bookId } = await new AddBookToShelfUseCase(repo).execute({
      userId: 'owner',
      title: '데미안',
      status: BookStatus.READING,
    });
    expect((await repo.findById(bookId))!.status).toBe(BookStatus.READING);
  });

  it('빈 제목은 도메인 예외로 거부되고 저장되지 않는다', async () => {
    const repo = new InMemoryBookRepository();
    await expect(
      new AddBookToShelfUseCase(repo).execute({ userId: 'owner', title: '  ' }),
    ).rejects.toThrow(EmptyBookTitleError);
    expect(await repo.findAll('owner')).toHaveLength(0);
  });
});
