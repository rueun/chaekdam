import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';
import { OwnedBy } from '@/lib/domain/reading-log/specs/owned-by';

/**
 * 테스트용 In-Memory ReadingSessionRepository — Mock 이 아닌 진짜 저장 동작(testing 규칙).
 * 유스케이스 단위 테스트에서 공유한다(외부 의존 0).
 */
export class InMemoryReadingSessionRepository implements ReadingSessionRepository {
  private readonly items = new Map<string, ReadingSession>();

  save(session: ReadingSession): Promise<void> {
    this.items.set(session.id, session);
    return Promise.resolve();
  }

  findAll(userId: string): Promise<ReadingSession[]> {
    return Promise.resolve(this.ownedBy(userId));
  }

  findByBookId(userId: string, bookId: string): Promise<ReadingSession[]> {
    return Promise.resolve(this.ownedBy(userId).filter((s) => s.bookId === bookId));
  }

  /** userId 소유분만 최근순으로(소유 범위 — RLS 없는 Fake 에서 OwnedBy 로 명시 필터, ADR-027). */
  private ownedBy(userId: string): ReadingSession[] {
    const owned = new OwnedBy(userId);
    return [...this.items.values()]
      .filter((s) => owned.isSatisfiedBy(s))
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
