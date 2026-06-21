import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import { OwnedBy } from '@/lib/domain/discussion/specs/owned-by';

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

  findAll(userId: string): Promise<Discussion[]> {
    return Promise.resolve(this.ownedBy(userId));
  }

  findByBookId(userId: string, bookId: string): Promise<Discussion[]> {
    return Promise.resolve(this.ownedBy(userId).filter((d) => d.bookId === bookId));
  }

  /** userId 소유분만 최신순으로(소유 범위 — RLS 없는 Fake 에서 OwnedBy 로 명시 필터, ADR-027). */
  private ownedBy(userId: string): Discussion[] {
    const owned = new OwnedBy(userId);
    return [...this.items.values()]
      .filter((d) => owned.isSatisfiedBy(d))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
