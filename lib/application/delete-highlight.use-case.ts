import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/**
 * 한 줄 삭제 유스케이스. 소유 범위는 Repository/RLS 가 보장한다(타인 한 줄은 영향 없음).
 * 없는 id 삭제는 조용히 통과(멱등).
 */
export class DeleteHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  execute(highlightId: string): Promise<void> {
    return this.highlights.remove(highlightId);
  }
}
