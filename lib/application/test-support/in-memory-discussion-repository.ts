import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';

/**
 * 테스트용 In-Memory DiscussionRepository — Mock 이 아닌 진짜 저장 동작(testing 규칙).
 * Discussion 은 불변 전체 객체라 id 기준 전체 교체가 곧 upsert.
 */
export class InMemoryDiscussionRepository implements DiscussionRepository {
  private readonly items = new Map<string, Discussion>();

  save(discussion: Discussion): Promise<void> {
    this.items.set(discussion.id, discussion);
    return Promise.resolve();
  }

  findById(id: string): Promise<Discussion | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findAll(): Promise<Discussion[]> {
    const sorted = [...this.items.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return Promise.resolve(sorted);
  }
}
