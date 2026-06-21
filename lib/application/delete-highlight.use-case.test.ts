import { describe, it, expect } from 'vitest';
import { DeleteHighlightUseCase } from './delete-highlight.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { HighlightAccessDeniedError, HighlightNotFoundError } from '@/lib/domain/shared/errors';

describe('DeleteHighlightUseCase', () => {
  it('본인 한 줄을 삭제한다', async () => {
    const repo = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '지울 한 줄');
    await repo.save(highlight);

    await new DeleteHighlightUseCase(repo).execute(highlight.id, 'owner');

    expect(await repo.findById(highlight.id)).toBeNull();
  });

  it('없는 id 삭제는 NotFound 로 막는다(ADR-027)', async () => {
    const repo = new InMemoryHighlightRepository();
    await expect(new DeleteHighlightUseCase(repo).execute('nope', 'owner')).rejects.toThrow(
      HighlightNotFoundError,
    );
  });

  it('타인의 한 줄은 삭제할 수 없다(ADR-027)', async () => {
    const repo = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '남의 한 줄');
    await repo.save(highlight);

    await expect(
      new DeleteHighlightUseCase(repo).execute(highlight.id, 'intruder'),
    ).rejects.toThrow(HighlightAccessDeniedError);
    expect(await repo.findById(highlight.id)).not.toBeNull(); // 삭제되지 않음
  });
});
