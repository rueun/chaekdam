import { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { PhotoStorage } from '@/lib/domain/ports/photo-storage';

/** 사진 한 줄 담기 명령 — 검토한 본문 + 원본 이미지(base64). */
export interface CaptureHighlightFromPhotoCommand {
  bookId: string;
  content: string;
  image: { base64: string; mediaType: string };
  page?: string | null;
}

/**
 * 사진 한 줄 담기 유스케이스(ADR-020) — 원본 사진을 저장하고 PHOTO 출처 Highlight 로 남긴다.
 * 업로드(PhotoStorage)와 저장(HighlightRepository)을 한 흐름으로 조율한다.
 * 두 Port 에만 의존(구현체 모름).
 */
export class CaptureHighlightFromPhotoUseCase {
  constructor(
    private readonly photos: PhotoStorage,
    private readonly highlights: HighlightRepository,
  ) {}

  async execute(command: CaptureHighlightFromPhotoCommand): Promise<void> {
    const photoUrl = await this.photos.store(command.image);
    try {
      const highlight = Highlight.fromPhoto(
        command.bookId,
        photoUrl,
        command.content,
        command.page ?? null,
      );
      await this.highlights.save(highlight);
    } catch (error) {
      // 업로드는 됐는데 본문 검증·저장이 실패하면 업로드한 사진을 정리해 고아 객체를 막는다.
      await this.photos.remove(photoUrl).catch(() => undefined);
      throw error;
    }
  }
}
