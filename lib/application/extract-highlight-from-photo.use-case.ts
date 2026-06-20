import type { HighlightExtractor } from '@/lib/domain/ports/highlight-extractor';

/** 사진에서 구절 추출 명령 — base64 이미지 + MIME. */
export interface ExtractHighlightFromPhotoCommand {
  base64: string;
  mediaType: string;
}

/**
 * 사진 → 구절 추출 유스케이스 — Vision Port 에 위임한다(저장은 별도, CaptureHighlight 가 담당).
 * Port 만 의존(구현체 모름). 추출 결과는 사용자가 검토·수정 후 저장한다.
 */
export class ExtractHighlightFromPhotoUseCase {
  constructor(private readonly extractor: HighlightExtractor) {}

  async execute(command: ExtractHighlightFromPhotoCommand): Promise<string> {
    return this.extractor.extractQuote({
      base64: command.base64,
      mediaType: command.mediaType,
    });
  }
}
