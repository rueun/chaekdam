import { describe, it, expect } from 'vitest';
import { DeleteHighlightUseCase } from './delete-highlight.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';

describe('DeleteHighlightUseCase', () => {
  it('한 줄을 삭제한다', async () => {
    const repo = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('b1', '지울 한 줄');
    await repo.save(highlight);

    await new DeleteHighlightUseCase(repo).execute(highlight.id);

    expect(await repo.findById(highlight.id)).toBeNull();
  });

  it('없는 id 삭제는 조용히 통과한다(멱등)', async () => {
    const repo = new InMemoryHighlightRepository();
    await expect(new DeleteHighlightUseCase(repo).execute('nope')).resolves.toBeUndefined();
  });
});
