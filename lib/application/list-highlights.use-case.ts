import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/**
 * 담은 한 줄 목록 조회(Query). 최신순. 소유 범위는 Repository/RLS 가 보장한다.
 */
export class ListHighlightsUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  execute(): Promise<Highlight[]> {
    return this.highlights.findAll();
  }
}
