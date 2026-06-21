import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { OwnedBy } from '@/lib/domain/highlight/specs/owned-by';
import { HighlightAccessDeniedError, HighlightNotFoundError } from '@/lib/domain/shared/errors';

/**
 * 한 줄을 불러오며 소유권을 검증한다(ADR-004/027 — 권한 이중 방어).
 * 없으면 NotFound, 소유자가 아니면 AccessDenied. mutate 유스케이스 공용.
 */
export async function loadOwnedHighlight(
  highlights: HighlightRepository,
  highlightId: string,
  userId: string,
): Promise<Highlight> {
  const highlight = await highlights.findById(highlightId);
  if (!highlight) throw new HighlightNotFoundError(highlightId);
  if (!new OwnedBy(userId).isSatisfiedBy(highlight)) {
    throw new HighlightAccessDeniedError(highlightId);
  }
  return highlight;
}
