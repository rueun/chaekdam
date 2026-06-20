import { describe, it, expect } from 'vitest';
import { ExtractHighlightFromPhotoUseCase } from './extract-highlight-from-photo.use-case';
import type { HighlightExtractor, PhotoQuoteImage } from '@/lib/domain/ports/highlight-extractor';

/** 결정적 Fake — 실제 Vision 대신 받은 이미지를 검사하고 고정 텍스트를 낸다. */
class FakeHighlightExtractor implements HighlightExtractor {
  lastImage: PhotoQuoteImage | null = null;
  constructor(private readonly result: string) {}
  extractQuote(image: PhotoQuoteImage): Promise<string> {
    this.lastImage = image;
    return Promise.resolve(this.result);
  }
}

describe('ExtractHighlightFromPhotoUseCase', () => {
  it('추출기에 이미지를 넘기고 구절 텍스트를 반환한다', async () => {
    const extractor = new FakeHighlightExtractor('새는 알에서 나오려고 투쟁한다.');
    const useCase = new ExtractHighlightFromPhotoUseCase(extractor);

    const text = await useCase.execute({ base64: 'AAAA', mediaType: 'image/jpeg' });

    expect(text).toBe('새는 알에서 나오려고 투쟁한다.');
    expect(extractor.lastImage).toEqual({ base64: 'AAAA', mediaType: 'image/jpeg' });
  });

  it('읽을 텍스트가 없으면 빈 문자열을 반환한다', async () => {
    const useCase = new ExtractHighlightFromPhotoUseCase(new FakeHighlightExtractor(''));
    const text = await useCase.execute({ base64: 'AAAA', mediaType: 'image/png' });
    expect(text).toBe('');
  });

  it('추출기 오류는 그대로 전파한다(진입점에서 처리)', async () => {
    const failing: HighlightExtractor = {
      extractQuote: () => Promise.reject(new Error('vision down')),
    };
    const useCase = new ExtractHighlightFromPhotoUseCase(failing);
    await expect(useCase.execute({ base64: 'AAAA', mediaType: 'image/jpeg' })).rejects.toThrow(
      'vision down',
    );
  });
});
