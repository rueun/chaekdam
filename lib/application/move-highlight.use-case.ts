import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedHighlight } from './highlight-ownership';

/** 한 줄 이동 명령 — 대상 책(+소유자 검증용 userId). */
export interface MoveHighlightCommand {
  highlightId: string;
  userId: string;
  bookId: string;
}

/**
 * 한 줄 이동 유스케이스 — 소유권을 검증하고 다른 책으로 옮겨 저장한다(ADR-027).
 * 대상 책 유효성(빈 값)은 도메인(Highlight.moveTo)이 강제한다. Port 만 의존.
 */
export class MoveHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: MoveHighlightCommand): Promise<void> {
    const highlight = await loadOwnedHighlight(
      this.highlights,
      command.highlightId,
      command.userId,
    );
    await this.highlights.save(highlight.moveTo(command.bookId));
  }
}
