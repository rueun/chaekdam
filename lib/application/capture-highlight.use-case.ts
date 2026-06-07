import { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/**
 * 한 줄 담기 명령 — 출처(텍스트/사진)에 따라 필요한 입력이 다르다.
 * 사진은 이미 업로드되어 URL 이 확보된 상태로 들어온다(업로드는 진입점/Infra 책임).
 */
export type CaptureHighlightCommand =
  | { source: typeof NoteSource.TEXT; bookId: string; content: string; page?: string | null }
  | {
      source: typeof NoteSource.PHOTO;
      bookId: string;
      content: string;
      photoUrl: string;
      page?: string | null;
    };

export interface CaptureHighlightResult {
  highlightId: string;
}

/**
 * 한 줄 담기 유스케이스 — 입력을 도메인 Highlight 로 만들고(불변식 강제) 저장한다.
 * 트랜잭션 경계 = Highlight Aggregate 1개. Port 만 의존(구현체 모름).
 */
export class CaptureHighlightUseCase {
  constructor(private readonly highlights: HighlightRepository) {}

  async execute(command: CaptureHighlightCommand): Promise<CaptureHighlightResult> {
    const page = command.page ?? null;
    const highlight =
      command.source === NoteSource.PHOTO
        ? Highlight.fromPhoto(command.bookId, command.photoUrl, command.content, page)
        : Highlight.fromText(command.bookId, command.content, page);

    await this.highlights.save(highlight);
    return { highlightId: highlight.id };
  }
}
