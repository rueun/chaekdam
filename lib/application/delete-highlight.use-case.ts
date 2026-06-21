import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedHighlight } from './highlight-ownership';

/**
 * 한 줄 삭제 유스케이스 — 소유권을 검증한 뒤 삭제한다(ADR-027, 권한 이중 방어).
 * 없거나 타인 한 줄이면 도메인 예외(NotFound/AccessDenied)로 막는다.
 */
export class DeleteHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(highlightId: string, userId: string): Promise<void> {
    await loadOwnedHighlight(this.highlights, highlightId, userId);
    await this.highlights.remove(highlightId, userId);
  }
}
