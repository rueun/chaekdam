import type { Highlight } from '@/lib/domain/highlight/highlight';

/**
 * 소유권 Specification(ADR-004/027) — 한 줄이 해당 사용자의 것인지.
 * RLS(1차)와 같은 규칙을 도메인에서 한 번 더 표현해, 백엔드 분리(RLS 부재) 시에도 권한이 유지된다.
 */
export class OwnedBy {
  constructor(private readonly userId: string) {}

  isSatisfiedBy(highlight: Highlight): boolean {
    return highlight.ownerId === this.userId;
  }
}
