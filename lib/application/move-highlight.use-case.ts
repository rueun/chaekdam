import { HighlightNotFoundError } from '@/lib/domain/shared/errors';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 한 줄 이동 명령 — 대상 책. */
export interface MoveHighlightCommand {
  highlightId: string;
  bookId: string;
}

/**
 * 한 줄 이동 유스케이스 — 기존 한 줄을 다른 책으로 옮겨 저장한다.
 * 대상 책 유효성(빈 값)은 도메인(Highlight.moveTo)이 강제한다. Port 만 의존.
 */
export class MoveHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: MoveHighlightCommand): Promise<void> {
    const highlight = await this.highlights.findById(command.highlightId);
    if (!highlight) throw new HighlightNotFoundError(command.highlightId);
    await this.highlights.save(highlight.moveTo(command.bookId));
  }
}
