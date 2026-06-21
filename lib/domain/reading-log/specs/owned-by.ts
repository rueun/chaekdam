import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { Specification } from '@/lib/domain/shared/specification';

/**
 * 소유권 Specification(ADR-004/027) — 독서 세션이 해당 사용자의 것인지.
 * RLS(1차)와 같은 규칙을 도메인에서 한 번 더 표현해, 백엔드 분리(RLS 부재) 시에도
 * 읽기 범위(본인 세션만 집계)가 유지된다.
 */
export class OwnedBy implements Specification<ReadingSession> {
  constructor(private readonly userId: string) {}

  isSatisfiedBy(session: ReadingSession): boolean {
    return session.ownerId === this.userId;
  }
}
