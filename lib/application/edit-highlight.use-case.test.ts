import { describe, it, expect } from 'vitest';
import { EditHighlightUseCase } from './edit-highlight.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { HighlightAccessDeniedError, HighlightNotFoundError } from '@/lib/domain/shared/errors';

describe('EditHighlightUseCase', () => {
  it('본문과 페이지를 수정해 저장한다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const original = Highlight.fromText('owner', 'b1', '원래 문장', '10');
    await highlights.save(original);

    const useCase = new EditHighlightUseCase(highlights);
    await useCase.execute({
      highlightId: original.id,
      userId: 'owner',
      content: '고친 문장',
      page: '42',
    });

    const found = await highlights.findById(original.id);
    expect(found?.content).toBe('고친 문장');
    expect(found?.page).toBe('42');
    expect(found?.id).toBe(original.id); // 같은 한 줄(식별자 유지)
  });

  it('빈 본문으로는 수정할 수 없다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const original = Highlight.fromText('owner', 'b1', '원래 문장');
    await highlights.save(original);

    const useCase = new EditHighlightUseCase(highlights);
    await expect(
      useCase.execute({ highlightId: original.id, userId: 'owner', content: '   ' }),
    ).rejects.toThrow();
  });

  it('없는 한 줄은 수정할 수 없다', async () => {
    const useCase = new EditHighlightUseCase(new InMemoryHighlightRepository());
    await expect(
      useCase.execute({ highlightId: 'nope', userId: 'owner', content: '...' }),
    ).rejects.toThrow(HighlightNotFoundError);
  });

  it('타인의 한 줄은 수정할 수 없다(ADR-027)', async () => {
    const highlights = new InMemoryHighlightRepository();
    const original = Highlight.fromText('owner', 'b1', '원래 문장');
    await highlights.save(original);

    const useCase = new EditHighlightUseCase(highlights);
    await expect(
      useCase.execute({ highlightId: original.id, userId: 'intruder', content: '몰래 수정' }),
    ).rejects.toThrow(HighlightAccessDeniedError);

    const found = await highlights.findById(original.id);
    expect(found?.content).toBe('원래 문장'); // 변경되지 않음
  });
});
