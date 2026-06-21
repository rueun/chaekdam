import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedHighlight } from './highlight-ownership';

/** 한 줄 보관 토글 명령(+소유자 검증용 userId). */
export interface ArchiveHighlightCommand {
  highlightId: string;
  userId: string;
  archived: boolean;
}

/**
 * 한 줄 보관/해제 유스케이스 — 소유권을 검증하고 도메인(archive/unarchive)에 위임한다(ADR-027). Port 만 의존.
 */
export class ArchiveHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: ArchiveHighlightCommand): Promise<void> {
    const highlight = await loadOwnedHighlight(
      this.highlights,
      command.highlightId,
      command.userId,
    );
    await this.highlights.save(command.archived ? highlight.archive() : highlight.unarchive());
  }
}
