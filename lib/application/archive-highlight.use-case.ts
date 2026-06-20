import { HighlightNotFoundError } from '@/lib/domain/shared/errors';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 한 줄 보관 토글 명령. */
export interface ArchiveHighlightCommand {
  highlightId: string;
  archived: boolean;
}

/**
 * 한 줄 보관/해제 유스케이스 — 상태 전이는 도메인(archive/unarchive)에 위임한다. Port 만 의존.
 */
export class ArchiveHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: ArchiveHighlightCommand): Promise<void> {
    const highlight = await this.highlights.findById(command.highlightId);
    if (!highlight) throw new HighlightNotFoundError(command.highlightId);
    await this.highlights.save(command.archived ? highlight.archive() : highlight.unarchive());
  }
}
