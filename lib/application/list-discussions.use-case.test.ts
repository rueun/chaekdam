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

    const all = await new ListDiscussionsUseCase(repo).execute();
    expect(all).toHaveLength(2);
  });

  it('없으면 빈 배열', async () => {
    expect(await new ListDiscussionsUseCase(new InMemoryDiscussionRepository()).execute()).toEqual(
      [],
    );
  });
});
