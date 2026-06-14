import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type {
  AiDiscussionPartner,
  DiscussionContext,
} from '@/lib/domain/ports/ai-discussion-partner';
import { buildSystemPrompt, buildDiscussionMessages } from './discussion-prompt';

/** 토론 품질을 위해 Sonnet 사용(ADR-005: 모델은 이 어댑터 안에서만 결정). */
const MODEL = 'claude-sonnet-4-6' as const;
const MAX_TOKENS = 1024;

/**
 * AiDiscussionPartner 의 Claude 어댑터(ADR-005·007). Anthropic SDK 는 이 파일에만 격리한다.
 * 책 메타·페르소나 톤은 시스템 프롬프트에 주입하고, 프롬프트 구성은 discussion-prompt 로 분리(테스트 용이).
 * 비스트리밍(완성 텍스트 반환) — 스트리밍은 후속.
 */
export class ClaudeAiDiscussionPartner implements AiDiscussionPartner {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async respond(context: DiscussionContext): Promise<string> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(context),
        messages: buildDiscussionMessages(context),
      });
    } catch (error) {
      // SDK 고유 예외를 기술 독립 오류로 감싼다(ADR-005, LLM 교체 시 상위 영향 차단).
      throw new Error('AI partner request failed', { cause: error });
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
    if (!text) throw new Error('Claude returned an empty response');
    return text;
  }
}
