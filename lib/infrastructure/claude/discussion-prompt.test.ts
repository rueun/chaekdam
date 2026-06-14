import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildDiscussionMessages } from './discussion-prompt';
import { Persona } from '@/lib/domain/persona/persona';
import { Role } from '@/lib/domain/discussion/role';
import type { DiscussionContext } from '@/lib/domain/ports/ai-discussion-partner';

function context(overrides: Partial<DiscussionContext> = {}): DiscussionContext {
  return {
    persona: Persona.of('socrates'),
    book: { title: '데미안', author: '헤르만 헤세' },
    seedHighlight: null,
    history: [],
    ...overrides,
  };
}

describe('buildSystemPrompt', () => {
  it('책 메타·페르소나 톤을 담는다', () => {
    const prompt = buildSystemPrompt(context());
    expect(prompt).toContain('데미안');
    expect(prompt).toContain('헤르만 헤세');
    expect(prompt).toContain('소크라테스');
  });

  it('시드 한 줄이 있으면 포함하고 없으면 생략한다', () => {
    expect(buildSystemPrompt(context({ seedHighlight: '새는 알에서' }))).toContain('새는 알에서');
    expect(buildSystemPrompt(context())).not.toContain('인상 깊게 남긴 한 줄');
  });
});

describe('buildDiscussionMessages', () => {
  it('이력이 비면 여는 말 요청 user 턴 하나뿐이다', () => {
    const messages = buildDiscussionMessages(context());
    expect(messages).toHaveLength(1);
    expect(messages[0]!.role).toBe('user');
  });

  it('user 로 시작하고 user/assistant 가 번갈며 마지막은 user 다', () => {
    const messages = buildDiscussionMessages(
      context({
        history: [
          { role: Role.AI, content: '여는 말' },
          { role: Role.USER, content: '제 생각은요' },
        ],
      }),
    );
    // [user opener, assistant 여는말, user 발화]
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(messages.at(-1)!.content).toBe('제 생각은요');
  });

  it('시드 한 줄을 여는 말 요청에 녹인다', () => {
    const [opener] = buildDiscussionMessages(context({ seedHighlight: '새는 알에서' }));
    expect(opener!.content).toContain('새는 알에서');
  });
});
