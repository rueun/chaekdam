import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';

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

  findAll(): Promise<ReadingSession[]> {
    // Port 계약(최근순)을 Fake 도 충실히 재현 — 정렬 의존 버그를 테스트가 잡도록.
    const sorted = [...this.items.values()].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    );
    return Promise.resolve(sorted);
  }
}
