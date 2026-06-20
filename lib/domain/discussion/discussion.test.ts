import { describe, it, expect } from 'vitest';
import { Discussion } from './discussion';
import { Message } from './message';
import type { PersonaKey } from '@/lib/domain/persona/persona';
import { PersonaNotAvailableError } from '@/lib/domain/shared/errors';

describe('Discussion', () => {
  describe('start', () => {
    it('책+페르소나로 빈 방을 연다', () => {
      const d = Discussion.start({ bookId: 'b1', personaKey: 'socrates' });
      expect(d.bookId).toBe('b1');
      expect(d.personaKey).toBe('socrates');
      expect(d.seedHighlightId).toBeNull();
      expect(d.messages).toHaveLength(0);
      expect(d.id).toBeTruthy();
    });

    it('시드 한 줄을 받을 수 있다', () => {
      const d = Discussion.start({ bookId: 'b1', personaKey: 'critic', seedHighlightId: 'h1' });
      expect(d.seedHighlightId).toBe('h1');
    });

    it('작가 본인 페르소나로도 방을 연다(사망 작가 제약은 StartDiscussion 이 검증, ADR-022)', () => {
      const d = Discussion.start({ bookId: 'b1', personaKey: 'author' });
      expect(d.personaKey).toBe('author');
    });

    it('정의되지 않은 페르소나는 거부한다', () => {
      expect(() => Discussion.start({ bookId: 'b1', personaKey: 'ghost' as PersonaKey })).toThrow(
        PersonaNotAvailableError,
      );
    });
  });

  describe('메시지 추가', () => {
    it('AI 발화를 더한 새 인스턴스를 반환하고 원본은 불변이다', () => {
      const d0 = Discussion.start({ bookId: 'b1', personaKey: 'socrates' });
      const d1 = d0.addAiMessage('무엇이 마음에 남았나요?');

      expect(d0.messages).toHaveLength(0); // 원본 불변
      expect(d1.messages).toHaveLength(1);
      expect(d1.lastMessage?.role).toBe('AI');
      expect(d1.messageCount).toBe(1);
      expect(d1).not.toBe(d0);
    });

    it('추가된 메시지의 discussionId 는 방 id 와 일치한다(루트가 직접 생성)', () => {
      const d = Discussion.start({ bookId: 'b1', personaKey: 'socrates' }).addUserMessage('안녕');
      expect(d.lastMessage?.discussionId).toBe(d.id);
    });

    it('사용자·AI 발화를 누적한다', () => {
      const d = Discussion.start({ bookId: 'b1', personaKey: 'friend' })
        .addAiMessage('안녕하세요')
        .addUserMessage('안녕');
      expect(d.messageCount).toBe(2);
      expect(d.messages[0]!.role).toBe('AI');
      expect(d.messages[1]!.role).toBe('USER');
    });
  });

  describe('restore', () => {
    it('저장된 상태(메시지 포함)를 복원한다', () => {
      const created = new Date('2026-06-14T00:00:00Z');
      const d = Discussion.restore({
        id: 'd1',
        bookId: 'b1',
        personaKey: 'socrates',
        seedHighlightId: null,
        title: '데미안 · 새는 알에서 나오려고',
        messages: [
          Message.restore({
            id: 'm1',
            discussionId: 'd1',
            role: 'AI',
            content: '여는 말',
            createdAt: created,
          }),
        ],
        createdAt: created,
      });
      expect(d.id).toBe('d1');
      expect(d.title).toContain('데미안');
      expect(d.messageCount).toBe(1);
      expect(Object.isFrozen(d)).toBe(true);
      expect(Object.isFrozen(d.messages)).toBe(true);
    });
  });

  describe('titleFromSeed', () => {
    it('시드가 없으면 null', () => {
      expect(Discussion.titleFromSeed(null)).toBeNull();
      expect(Discussion.titleFromSeed('   ')).toBeNull();
    });

    it('짧은 시드는 그대로', () => {
      expect(Discussion.titleFromSeed('새는 알에서 나오려고 투쟁한다')).toBe(
        '새는 알에서 나오려고 투쟁한다',
      );
    });

    it('40자를 넘으면 잘라 말줄임표를 붙인다', () => {
      const long = 'ㄱ'.repeat(50);
      const title = Discussion.titleFromSeed(long)!;
      expect(title).toHaveLength(41); // 40자 + …
      expect(title.endsWith('…')).toBe(true);
    });

    it('정확히 40자는 그대로(경계)', () => {
      const exact = 'ㄴ'.repeat(40);
      expect(Discussion.titleFromSeed(exact)).toBe(exact);
    });
  });

  it('방과 메시지 배열은 동결되어 있다', () => {
    const d = Discussion.start({ bookId: 'b1', personaKey: 'socrates' }).addAiMessage('여는 말');
    expect(Object.isFrozen(d)).toBe(true);
    expect(Object.isFrozen(d.messages)).toBe(true);
    expect(() => {
      // readonly 를 캐스트로 우회해도 동결된 배열이라 런타임에서 막힌다.
      (d.messages as Message[]).push(Message.fromUser('d', '끼어들기'));
    }).toThrow(TypeError);
  });
});
