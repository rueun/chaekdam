import { describe, it, expect } from 'vitest';
import { ListHighlightsUseCase } from './list-highlights.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';

async function repoWith(...highlights: Highlight[]): Promise<InMemoryHighlightRepository> {
  const repo = new InMemoryHighlightRepository();
  for (const highlight of highlights) await repo.save(highlight);
  return repo;
}

describe('ListHighlightsUseCase', () => {
  it('기본(active) 범위는 보관하지 않은 한 줄을 돌려준다', async () => {
    const repo = await repoWith(
      Highlight.fromText('b1', '문장 1'),
      Highlight.fromText('b2', '문장 2').archive(),
    );
    const result = await new ListHighlightsUseCase(repo).execute();
    expect(result).toHaveLength(1);
    expect(result[0]!.content).toBe('문장 1');
  });

  it('고정한 한 줄을 목록 상단에 둔다', async () => {
    const first = Highlight.fromText('b1', '먼저');
    const second = Highlight.fromText('b1', '나중').pin();
    const repo = await repoWith(first, second);
    const result = await new ListHighlightsUseCase(repo).execute();
    expect(result[0]!.content).toBe('나중'); // 고정 우선
  });

  it("'archived' 범위는 보관한 한 줄만 돌려준다", async () => {
    const repo = await repoWith(
      Highlight.fromText('b1', '문장 1'),
      Highlight.fromText('b2', '보관됨').archive(),
    );
    const result = await new ListHighlightsUseCase(repo).execute('archived');
    expect(result).toHaveLength(1);
    expect(result[0]!.content).toBe('보관됨');
  });

  it('담은 한 줄이 없으면 빈 목록을 돌려준다', async () => {
    const result = await new ListHighlightsUseCase(new InMemoryHighlightRepository()).execute();
    expect(result).toEqual([]);
  });
});
