import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedHighlight } from './highlight-ownership';

/** 한 줄 수정 명령 — 본문·페이지·태그(+소유자 검증용 userId). */
export interface EditHighlightCommand {
  highlightId: string;
  userId: string;
  content: string;
  page?: string | null;
  tags?: readonly string[];
}

/**
 * 한 줄 수정 유스케이스 — 소유권을 검증하고 본문·페이지·태그를 고쳐 저장한다(ADR-027).
 * 본문 재검증은 도메인(Highlight.edit)이 강제한다. Port 만 의존.
 */
export class EditHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: EditHighlightCommand): Promise<void> {
    const highlight = await loadOwnedHighlight(
      this.highlights,
      command.highlightId,
      command.userId,
    );
    await this.highlights.save(
      highlight.edit({ content: command.content, page: command.page ?? null, tags: command.tags }),
    );
  }
}
