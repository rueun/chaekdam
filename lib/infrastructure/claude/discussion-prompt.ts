import type Anthropic from '@anthropic-ai/sdk';
import { Role } from '@/lib/domain/discussion/role';
import type { DiscussionContext } from '@/lib/domain/ports/ai-discussion-partner';

// 순수 프롬프트 구성 로직(SDK I/O·server-only 없음) — 단위 테스트 대상.
// Anthropic 타입은 type-only import 라 런타임에 SDK 를 로드하지 않는다.

/**
 * 시스템 프롬프트 — 공통 지침 + 페르소나 톤 + 책 메타(+시드 한 줄).
 * TODO(perf): 한 토론 안에서 턴마다 동일하므로 프롬프트 캐싱(cache_control) 대상이다.
 * SDK 0.30 에선 beta API(client.beta.promptCaching) 가 필요해 일단 일반 문자열로 둔다
 * (책 메타가 작아 현 시점 절감 효과 미미). SDK 업그레이드 시 캐싱 블록으로 전환.
 */
export function buildSystemPrompt(context: DiscussionContext): string {
  const authorPart = context.book.author ? ` (저자: ${context.book.author})` : '';
  return [
    '당신은 사용자와 한 권의 책을 두고 한국어로 독서 토론을 나눕니다.',
    `책: 『${context.book.title}』${authorPart}`,
    `토론자 역할(${context.persona.name}): ${context.persona.tone}`,
    context.seedHighlight ? `사용자가 인상 깊게 남긴 한 줄: "${context.seedHighlight}"` : null,
    '5~10턴 내외의 깊이로 대화하세요. 캐릭터를 일관되게 유지하고, 한 번에 너무 길게 말하지 말고 대화를 이어가세요.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n\n');
}

/**
 * 대화 메시지 구성. Anthropic 은 user 로 시작하고 user/assistant 가 번갈아야 하므로,
 * 항상 합성 '여는 말 요청' user 턴을 맨 앞에 두고 그 뒤에 실제 이력을 잇는다.
 * - 이력이 비면(첫 발화): [여는 말 요청] → AI 가 여는 말을 생성.
 * - 이력이 있으면: [여는 말 요청, AI 여는말(assistant), 사용자, …, 사용자] → AI 가 다음 응답을 생성.
 *
 * 이력은 항상 AI 여는말(assistant)로 시작한다(StartDiscussion 이 보장). 따라서 합성 user 턴을
 * 앞에 두면 user/assistant 교대가 유지된다.
 */
export function buildDiscussionMessages(context: DiscussionContext): Anthropic.MessageParam[] {
  const opener = context.seedHighlight
    ? `이 한 줄에서 대화를 열어 주세요: "${context.seedHighlight}"`
    : '이 책에 대해 먼저 말을 건네며 대화를 열어 주세요.';

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: opener }];
  for (const turn of context.history) {
    messages.push({
      role: turn.role === Role.AI ? 'assistant' : 'user',
      content: turn.content,
    });
  }
  return messages;
}
