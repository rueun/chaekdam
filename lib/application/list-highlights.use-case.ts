import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 목록 범위 — 활성(보관 제외) / 보관함. */
export type HighlightScope = 'active' | 'archived';

/**
 * 담은 한 줄 목록 조회(Query). 기본은 활성(보관 제외·고정 우선), 'archived' 면 보관함.
 * 소유 범위는 Repository/RLS 가 보장한다.
 */
export class ListHighlightsUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  execute(scope: HighlightScope = 'active'): Promise<Highlight[]> {
    return scope === 'archived' ? this.highlights.findArchived() : this.highlights.findAll();
  }
}
