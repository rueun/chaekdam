import { HighlightNotFoundError } from '@/lib/domain/shared/errors';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 한 줄 수정 명령 — 본문·페이지. */
export interface EditHighlightCommand {
  highlightId: string;
  content: string;
  page?: string | null;
  tags?: readonly string[];
}

/**
 * 한 줄 수정 유스케이스 — 기존 한 줄을 불러와 본문·페이지를 고쳐 저장한다.
 * 본문 재검증은 도메인(Highlight.edit)이 강제한다. Port 만 의존.
 */
export class EditHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: EditHighlightCommand): Promise<void> {
    const highlight = await this.highlights.findById(command.highlightId);
    if (!highlight) throw new HighlightNotFoundError(command.highlightId);
    await this.highlights.save(
      highlight.edit({ content: command.content, page: command.page ?? null, tags: command.tags }),
    );
  }
}
