import { describe, it, expect } from 'vitest';
import { ListHighlightsUseCase } from './list-highlights.use-case';
import { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

class InMemoryHighlightRepository implements HighlightRepository {
  constructor(private readonly items: Highlight[] = []) {}
  save(): Promise<void> {
    return Promise.resolve();
  }
  findById(id: string): Promise<Highlight | null> {
    return Promise.resolve(this.items.find((h) => h.id === id) ?? null);
  }
  findByBookId(bookId: string): Promise<Highlight[]> {
    return Promise.resolve(this.items.filter((h) => h.bookId === bookId));
  }
  findAll(): Promise<Highlight[]> {
    return Promise.resolve([...this.items]);
  }
}

describe('ListHighlightsUseCase', () => {
  it('담은 한 줄 전체를 돌려준다', async () => {
    const repo = new InMemoryHighlightRepository([
      Highlight.fromText('b1', '문장 1'),
      Highlight.fromText('b2', '문장 2'),
    ]);
    const result = await new ListHighlightsUseCase(repo).execute();
    expect(result).toHaveLength(2);
    expect(result.map((h) => h.content)).toEqual(['문장 1', '문장 2']);
  });

  it('담은 한 줄이 없으면 빈 목록을 돌려준다', async () => {
    const result = await new ListHighlightsUseCase(new InMemoryHighlightRepository()).execute();
    expect(result).toEqual([]);
  });
});
