import { describe, it, expect } from 'vitest';
import { PinHighlightUseCase } from './pin-highlight.use-case';
import { ArchiveHighlightUseCase } from './archive-highlight.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { HighlightAccessDeniedError, HighlightNotFoundError } from '@/lib/domain/shared/errors';

describe('PinHighlightUseCase', () => {
  it('고정하면 활성 목록 상단에 오고, 해제하면 풀린다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const first = Highlight.fromText('owner', 'b1', '먼저');
    const second = Highlight.fromText('owner', 'b1', '나중');
    await highlights.save(first);
    await highlights.save(second);

    const useCase = new PinHighlightUseCase(highlights);
    await useCase.execute({ highlightId: first.id, userId: 'owner', pinned: true });

    // 먼저 담긴 것이 고정되어 최신(second)보다 앞에 온다.
    const pinnedFirst = await highlights.findAll();
    expect(pinnedFirst[0]!.id).toBe(first.id);
    expect(pinnedFirst[0]!.pinned).toBe(true);

    await useCase.execute({ highlightId: first.id, userId: 'owner', pinned: false });
    expect((await highlights.findById(first.id))!.pinned).toBe(false);
  });

  it('없는 한 줄은 고정할 수 없다', async () => {
    const useCase = new PinHighlightUseCase(new InMemoryHighlightRepository());
    await expect(
      useCase.execute({ highlightId: 'nope', userId: 'owner', pinned: true }),
    ).rejects.toThrow(HighlightNotFoundError);
  });

  it('타인의 한 줄은 고정할 수 없다(ADR-027)', async () => {
    const highlights = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '문장');
    await highlights.save(highlight);

    const useCase = new PinHighlightUseCase(highlights);
    await expect(
      useCase.execute({ highlightId: highlight.id, userId: 'intruder', pinned: true }),
    ).rejects.toThrow(HighlightAccessDeniedError);
    expect((await highlights.findById(highlight.id))!.pinned).toBe(false); // 고정되지 않음
  });
});

describe('ArchiveHighlightUseCase', () => {
  it('보관하면 기본 목록에서 빠지고 보관함에 들어간다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '문장');
    await highlights.save(highlight);

    const useCase = new ArchiveHighlightUseCase(highlights);
    await useCase.execute({ highlightId: highlight.id, userId: 'owner', archived: true });

    expect(await highlights.findAll()).toHaveLength(0);
    expect(await highlights.findArchived()).toHaveLength(1);

    await useCase.execute({ highlightId: highlight.id, userId: 'owner', archived: false });
    expect(await highlights.findAll()).toHaveLength(1);
    expect(await highlights.findArchived()).toHaveLength(0);
  });

  it('보관하면 고정도 해제된다', async () => {
    const highlights = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '문장').pin();
    await highlights.save(highlight);

    await new ArchiveHighlightUseCase(highlights).execute({
      highlightId: highlight.id,
      userId: 'owner',
      archived: true,
    });
    expect((await highlights.findArchived())[0]!.pinned).toBe(false);
  });

  it('없는 한 줄은 보관할 수 없다', async () => {
    const useCase = new ArchiveHighlightUseCase(new InMemoryHighlightRepository());
    await expect(
      useCase.execute({ highlightId: 'nope', userId: 'owner', archived: true }),
    ).rejects.toThrow(HighlightNotFoundError);
  });

  it('타인의 한 줄은 보관할 수 없다(ADR-027)', async () => {
    const highlights = new InMemoryHighlightRepository();
    const highlight = Highlight.fromText('owner', 'b1', '문장');
    await highlights.save(highlight);

    const useCase = new ArchiveHighlightUseCase(highlights);
    await expect(
      useCase.execute({ highlightId: highlight.id, userId: 'intruder', archived: true }),
    ).rejects.toThrow(HighlightAccessDeniedError);
    expect((await highlights.findById(highlight.id))!.archived).toBe(false); // 보관되지 않음
  });
});
