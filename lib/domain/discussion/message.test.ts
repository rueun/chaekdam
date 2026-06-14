import { describe, it, expect } from 'vitest';
import { Message, MESSAGE_CONTENT_MAX_LENGTH } from './message';
import { EmptyMessageContentError, MessageContentTooLongError } from '@/lib/domain/shared/errors';

describe('Message', () => {
  it('사용자 발화를 만든다', () => {
    const m = Message.fromUser('d1', '이 문장이 인상 깊었어요');
    expect(m.discussionId).toBe('d1');
    expect(m.role).toBe('USER');
    expect(m.content).toBe('이 문장이 인상 깊었어요');
    expect(m.id).toBeTruthy();
  });

  it('AI 발화를 만든다', () => {
    const m = Message.fromAi('d1', '어떤 점이 그렇게 다가왔을까요?');
    expect(m.role).toBe('AI');
  });

  it('앞뒤 공백을 정규화한다', () => {
    expect(Message.fromUser('d1', '  안녕  ').content).toBe('안녕');
  });

  it('빈 본문은 거부한다', () => {
    expect(() => Message.fromUser('d1', '   ')).toThrow(EmptyMessageContentError);
  });

  it('허용 길이를 넘으면 거부한다', () => {
    const tooLong = 'ㄱ'.repeat(MESSAGE_CONTENT_MAX_LENGTH + 1);
    expect(() => Message.fromAi('d1', tooLong)).toThrow(MessageContentTooLongError);
  });

  it('정확히 최대 길이면 허용한다(경계)', () => {
    const exact = 'ㄱ'.repeat(MESSAGE_CONTENT_MAX_LENGTH);
    expect(Message.fromUser('d1', exact).content).toHaveLength(MESSAGE_CONTENT_MAX_LENGTH);
  });

  it('복원된 발화는 동결되어 있다', () => {
    const m = Message.restore({
      id: 'm1',
      discussionId: 'd1',
      role: 'AI',
      content: '복원',
      createdAt: new Date(),
    });
    expect(Object.isFrozen(m)).toBe(true);
    expect(() => {
      // @ts-expect-error 런타임 불변성 검증
      m.content = '변경';
    }).toThrow(TypeError);
  });
});
