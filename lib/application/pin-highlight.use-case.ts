import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedHighlight } from './highlight-ownership';

/** 한 줄 고정 토글 명령(+소유자 검증용 userId). */
export interface PinHighlightCommand {
  highlightId: string;
  userId: string;
  pinned: boolean;
}

/**
 * 한 줄 고정/해제 유스케이스 — 소유권을 검증하고 도메인(pin/unpin)에 위임한다(ADR-027). Port 만 의존.
 */
export class PinHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: PinHighlightCommand): Promise<void> {
    const highlight = await loadOwnedHighlight(
      this.highlights,
      command.highlightId,
      command.userId,
    );
    await this.highlights.save(command.pinned ? highlight.pin() : highlight.unpin());
  }
}
