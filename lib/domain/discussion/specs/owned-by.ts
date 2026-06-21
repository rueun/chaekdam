import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { Specification } from '@/lib/domain/shared/specification';

/**
 * 소유권 Specification(ADR-004/027) — 토론 방이 해당 사용자의 것인지.
 * RLS(1차)와 같은 규칙을 도메인에서 한 번 더 표현해, 백엔드 분리(RLS 부재) 시에도 권한이 유지된다.
 */
export class OwnedBy implements Specification<Discussion> {
  constructor(private readonly userId: string) {}

  isSatisfiedBy(discussion: Discussion): boolean {
    return discussion.ownerId === this.userId;
  }
}
