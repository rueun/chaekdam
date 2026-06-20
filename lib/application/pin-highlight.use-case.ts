import { HighlightNotFoundError } from '@/lib/domain/shared/errors';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 한 줄 고정 토글 명령. */
export interface PinHighlightCommand {
  highlightId: string;
  pinned: boolean;
}

/**
 * 한 줄 고정/해제 유스케이스 — 상태 전이는 도메인(pin/unpin)에 위임한다. Port 만 의존.
 */
export class PinHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: PinHighlightCommand): Promise<void> {
    const highlight = await this.highlights.findById(command.highlightId);
    if (!highlight) throw new HighlightNotFoundError(command.highlightId);
    await this.highlights.save(command.pinned ? highlight.pin() : highlight.unpin());
  }
}
