import { describe, it, expect } from 'vitest';
import { ListDiscussionsUseCase } from './list-discussions.use-case';
import { InMemoryDiscussionRepository } from './test-support/in-memory-discussion-repository';
import { Discussion } from '@/lib/domain/discussion/discussion';

describe('ListDiscussionsUseCase', () => {
  it('저장된 토론을 최신순으로 반환한다', async () => {
    const repo = new InMemoryDiscussionRepository();
    await repo.save(
      Discussion.start({ ownerId: 'owner', bookId: 'b1', personaKey: 'socrates' }).addAiMessage(
        '첫 방',
      ),
    );
    await repo.save(
      Discussion.start({ ownerId: 'owner', bookId: 'b2', personaKey: 'critic' }).addAiMessage(
        '둘째 방',
      ),
    );

    const all = await new ListDiscussionsUseCase(repo).execute('owner');
    expect(all).toHaveLength(2);
  });

  it('타인의 토론은 목록에 섞이지 않는다(ADR-027, RLS 없이도 소유 범위)', async () => {
    const repo = new InMemoryDiscussionRepository();
    await repo.save(
      Discussion.start({ ownerId: 'owner', bookId: 'b1', personaKey: 'socrates' }).addAiMessage(
        '내 방',
      ),
    );
    await repo.save(
      Discussion.start({ ownerId: 'intruder', bookId: 'b1', personaKey: 'critic' }).addAiMessage(
        '남의 방',
      ),
    );

    const mine = await new ListDiscussionsUseCase(repo).execute('owner');
    expect(mine).toHaveLength(1);
    expect(mine[0]!.ownerId).toBe('owner');
  });

  it('없으면 빈 배열', async () => {
    expect(
      await new ListDiscussionsUseCase(new InMemoryDiscussionRepository()).execute('owner'),
    ).toEqual([]);
  });
});
