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

// 프롬프트 캐싱(ADR-018) — SDK 0.30 에선 cache_control 이 beta 네임스페이스에만 있어 beta API 를 쓴다.
type CacheControl = Anthropic.Beta.PromptCaching.PromptCachingBetaCacheControlEphemeral;
type SystemBlock = Anthropic.Beta.PromptCaching.PromptCachingBetaTextBlockParam;
type CachedMessage = Anthropic.Beta.PromptCaching.PromptCachingBetaMessageParam;

const EPHEMERAL: CacheControl = { type: 'ephemeral' };

/** 시스템 프롬프트를 캐시 표식 블록으로 감싼다(매 턴 동일 → 캐시 히트). */
function toCachedSystem(system: string): SystemBlock[] {
  return [{ type: 'text', text: system, cache_control: EPHEMERAL }];
}

/**
 * 대화 이력을 캐시 가능한 메시지로 변환한다. 마지막 메시지에만 캐시 표식을 달아
 * "직전까지의 이력 prefix"를 캐싱한다 — 다음 턴엔 그 prefix 가 그대로 재현돼 캐시 히트(증분 캐싱).
 * 이력이 최소 토큰 미만이면 캐시는 자동 비활성(과금·동작 영향 없음).
 */
function toCachedMessages(messages: Anthropic.MessageParam[]): CachedMessage[] {
  return messages.map((message, index) => {
    // buildDiscussionMessages 는 항상 문자열 content 를 만들지만, 배열(텍스트 블록)이 와도
    // 텍스트를 잃지 않도록 합쳐서 추출한다(이미지 등 비텍스트 블록은 토론에 안 쓰여 무시).
    const text =
      typeof message.content === 'string'
        ? message.content
        : message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
    const isLast = index === messages.length - 1;
    return isLast
      ? { role: message.role, content: [{ type: 'text', text, cache_control: EPHEMERAL }] }
      : { role: message.role, content: text };
  });
}

/**
 * AiDiscussionPartner 의 Claude 어댑터(ADR-005·007·017·018). Anthropic SDK 는 이 파일에만 격리한다.
 * 책 메타·페르소나 톤은 시스템 프롬프트에 주입하고, 프롬프트 구성은 discussion-prompt 로 분리(테스트 용이).
 * 시스템 + 대화 이력 prefix 를 프롬프트 캐싱(ADR-018)해 긴 대화의 재전송 비용을 줄인다.
 * 비스트리밍(`respond`) + 스트리밍(`respondStream`) 모두 같은 캐싱 파라미터를 쓴다.
 */
export class ClaudeAiDiscussionPartner implements AiDiscussionPartner {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async respond(context: DiscussionContext): Promise<string> {
    let response: Anthropic.Beta.PromptCaching.PromptCachingBetaMessage;
    try {
      response = await this.client.beta.promptCaching.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: toCachedSystem(buildSystemPrompt(context)),
        messages: toCachedMessages(buildDiscussionMessages(context)),
      });
    } catch (error) {
      // SDK 고유 예외를 기술 독립 오류로 감싼다(ADR-005, LLM 교체 시 상위 영향 차단).
      throw new Error('AI partner request failed', { cause: error });
    }

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim();
    if (!text) throw new Error('Claude returned an empty response');
    return text;
  }

  /**
   * 스트리밍 응답 — 텍스트 델타를 도착하는 대로 yield 한다(ADR-017).
   * 소비자(유스케이스)가 누적·검증·저장을 담당한다. SDK 스트림 이벤트는 이 안에서만 다룬다.
   */
  async *respondStream(context: DiscussionContext): AsyncIterable<string> {
    let stream: AsyncIterable<Anthropic.Beta.PromptCaching.RawPromptCachingBetaMessageStreamEvent>;
    try {
      stream = await this.client.beta.promptCaching.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: toCachedSystem(buildSystemPrompt(context)),
        messages: toCachedMessages(buildDiscussionMessages(context)),
        stream: true,
      });
    } catch (error) {
      throw new Error('AI partner stream failed', { cause: error });
    }

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
