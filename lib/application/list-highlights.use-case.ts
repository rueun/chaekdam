import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightPage, HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 목록 범위 — 활성(보관 제외) / 보관함. */
export type HighlightScope = 'active' | 'archived';

/**
 * 담은 한 줄 목록 조회(Query). 기본은 활성(보관 제외·고정 우선), 'archived' 면 보관함.
 * page 로 '더보기' 페이지네이션(ADR-025). userId 소유 범위는 Repository 계약으로 명시(ADR-027).
 */
export class ListHighlightsUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  execute(
    userId: string,
    scope: HighlightScope = 'active',
    page?: HighlightPage,
  ): Promise<Highlight[]> {
    return scope === 'archived'
      ? this.highlights.findArchived(userId, page)
      : this.highlights.findAll(userId, page);
  }
}
