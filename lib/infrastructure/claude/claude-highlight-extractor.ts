import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { HighlightExtractor, PhotoQuoteImage } from '@/lib/domain/ports/highlight-extractor';

/** Vision 품질을 위해 Sonnet 사용(ADR-005·019: 모델은 이 어댑터 안에서만 결정). */
const MODEL = 'claude-sonnet-4-6' as const;
const MAX_TOKENS = 512;

/** Claude 가 받는 이미지 MIME(그 외는 jpeg 로 간주). */
type ClaudeMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
const ALLOWED: readonly ClaudeMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const SYSTEM_PROMPT = [
  '당신은 책 사진에서 문장을 정확히 읽어내는 도우미입니다.',
  '사진 속 본문에서 가장 인상적인 한 구절(1~3문장)을 원문 그대로 옮겨 적습니다.',
  '설명·따옴표·머리말 없이 구절 텍스트만 출력하세요. 읽을 텍스트가 없으면 아무것도 출력하지 마세요.',
].join(' ');

/**
 * HighlightExtractor 의 Claude Vision 어댑터(ADR-005·019). Anthropic SDK 는 이 파일에만 격리한다.
 * 별도 OCR(Tesseract 등) 없이 멀티모달 비전으로 사진에서 구절을 추출한다(stack.md).
 */
export class ClaudeHighlightExtractor implements HighlightExtractor {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async extractQuote(image: PhotoQuoteImage): Promise<string> {
    const mediaType: ClaudeMediaType = ALLOWED.includes(image.mediaType as ClaudeMediaType)
      ? (image.mediaType as ClaudeMediaType)
      : 'image/jpeg';

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: image.base64 },
              },
              { type: 'text', text: '이 사진에서 한 구절을 추출해 주세요.' },
            ],
          },
        ],
      });
    } catch (error) {
      // SDK 고유 예외를 기술 독립 오류로 감싼다(ADR-005, 구현 교체 시 상위 영향 차단).
      throw new Error('Highlight extraction failed', { cause: error });
    }

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim();
  }
}
