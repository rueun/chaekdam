import { describe, it, expect } from 'vitest';
import { MoveHighlightUseCase } from './move-highlight.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { HighlightNotFoundError } from '@/lib/domain/shared/errors';

describe('MoveHighlightUseCase', () => {
  it('한 줄을 다른 책으로 옮긴다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const original = Highlight.fromText('book-a', '문장');
    await highlights.save(original);

    const useCase = new MoveHighlightUseCase(highlights);
    await useCase.execute({ highlightId: original.id, bookId: 'book-b' });

    expect(await highlights.findByBookId('book-a')).toHaveLength(0);
    const moved = (await highlights.findByBookId('book-b'))[0]!;
    expect(moved.id).toBe(original.id);
    expect(moved.content).toBe('문장');
  });

  it('없는 한 줄은 옮길 수 없다', async () => {
    const useCase = new MoveHighlightUseCase(new InMemoryHighlightRepository());
    await expect(useCase.execute({ highlightId: 'nope', bookId: 'b1' })).rejects.toThrow(
      HighlightNotFoundError,
    );
  });

  it('대상 책이 비면 옮길 수 없다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const original = Highlight.fromText('book-a', '문장');
    await highlights.save(original);
    const useCase = new MoveHighlightUseCase(highlights);
    await expect(useCase.execute({ highlightId: original.id, bookId: '  ' })).rejects.toThrow();
  });
});
