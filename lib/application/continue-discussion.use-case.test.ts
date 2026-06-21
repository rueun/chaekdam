import { describe, it, expect } from 'vitest';
import { ContinueDiscussionUseCase } from './continue-discussion.use-case';
import { StartDiscussionUseCase } from './start-discussion.use-case';
import { InMemoryDiscussionRepository } from './test-support/in-memory-discussion-repository';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { FakeAiDiscussionPartner } from './test-support/fake-ai-discussion-partner';
import { Book } from '@/lib/domain/book/book';
import { DiscussionAccessDeniedError, DiscussionNotFoundError } from '@/lib/domain/shared/errors';

async function setupStartedRoom() {
  const discussions = new InMemoryDiscussionRepository();
  const ai = new FakeAiDiscussionPartner();
  const books = new InMemoryBookRepository();
  const highlights = new InMemoryHighlightRepository();
  const book = Book.register({ ownerId: 'owner', title: '데미안', author: '헤르만 헤세' });
  await books.save(book);
  const room = await new StartDiscussionUseCase(discussions, ai, books, highlights).execute({
    userId: 'owner',
    bookId: book.id,
    personaKey: 'socrates',
  });
  const continueUseCase = new ContinueDiscussionUseCase(discussions, ai, books, highlights);
  return { discussions, ai, continueUseCase, room, books, highlights };
}

describe('ContinueDiscussionUseCase', () => {
  it('사용자 발화 후 AI 응답이 더해진다', async () => {
    const { continueUseCase, room } = await setupStartedRoom();

    const updated = await continueUseCase.execute({
      userId: 'owner',
      discussionId: room.id,
      content: '저는 이 문장이 두렵게 느껴졌어요',
    });

    // 시작 시 AI 1 + 사용자 1 + AI 1 = 3
    expect(updated.messageCount).toBe(3);
    expect(updated.messages[1]!.role).toBe('USER');
    expect(updated.messages[1]!.content).toBe('저는 이 문장이 두렵게 느껴졌어요');
    expect(updated.messages[2]!.role).toBe('AI');
  });

  it('AI 에 사용자 발화까지 포함한 이력을 넘긴다', async () => {
    const { continueUseCase, ai, room } = await setupStartedRoom();

    await continueUseCase.execute({
      userId: 'owner',
      discussionId: room.id,
      content: '안녕하세요',
    });

    // 여는 말(AI) + 방금 사용자 발화 = 2턴이 컨텍스트로 전달됨
    expect(ai.lastContext?.history).toHaveLength(2);
    expect(ai.lastContext?.history.at(-1)).toEqual({ role: 'USER', content: '안녕하세요' });
  });

  it('변경이 저장되어 다시 조회된다', async () => {
    const { continueUseCase, discussions, room } = await setupStartedRoom();

    await continueUseCase.execute({ userId: 'owner', discussionId: room.id, content: '한 번 더' });
    const found = await discussions.findById(room.id);

    expect(found?.messageCount).toBe(3);
  });

  it('없는 토론은 이어갈 수 없다', async () => {
    const { continueUseCase } = await setupStartedRoom();
    await expect(
      continueUseCase.execute({ userId: 'owner', discussionId: 'nope', content: '...' }),
    ).rejects.toThrow(DiscussionNotFoundError);
  });

  it('타인의 토론은 이어갈 수 없다(ADR-027)', async () => {
    const { continueUseCase, discussions, room } = await setupStartedRoom();
    await expect(
      continueUseCase.execute({ userId: 'intruder', discussionId: room.id, content: '끼어들기' }),
    ).rejects.toThrow(DiscussionAccessDeniedError);

    // 타인 발화가 더해지지 않았다(여는 말 1개 그대로).
    expect((await discussions.findById(room.id))?.messageCount).toBe(1);
  });

  describe('executeStreaming', () => {
    it('델타를 흘려보내고 완료 후 사용자+AI 메시지를 저장한다', async () => {
      const { continueUseCase, discussions, room } = await setupStartedRoom();

      const deltas: string[] = [];
      for await (const delta of continueUseCase.executeStreaming({
        userId: 'owner',
        discussionId: room.id,
        content: '한 줄을 곱씹어 봤어요',
      })) {
        deltas.push(delta);
      }

      // 여러 조각으로 나뉘어 도착하고, 합치면 완성 텍스트가 된다.
      expect(deltas.length).toBeGreaterThan(1);
      const full = deltas.join('');

      // 시작 AI 1 + 사용자 1 + AI 1 = 3, 마지막 AI 발화 = 스트림 누적분
      const found = await discussions.findById(room.id);
      expect(found?.messageCount).toBe(3);
      expect(found?.messages[1]!.content).toBe('한 줄을 곱씹어 봤어요');
      expect(found?.messages[2]!.role).toBe('AI');
      expect(found?.messages[2]!.content).toBe(full);
    });

    it('없는 토론은 스트리밍으로도 이어갈 수 없다', async () => {
      const { continueUseCase } = await setupStartedRoom();
      const iterate = async () => {
        for await (const chunk of continueUseCase.executeStreaming({
          userId: 'owner',
          discussionId: 'nope',
          content: '...',
        })) {
          void chunk; // 소비만 — 도달 전에 throw 되어야 한다.
        }
      };
      await expect(iterate()).rejects.toThrow(DiscussionNotFoundError);
    });

    it('타인의 토론은 스트리밍으로도 이어갈 수 없다(ADR-027)', async () => {
      const { continueUseCase, room } = await setupStartedRoom();
      const iterate = async () => {
        for await (const chunk of continueUseCase.executeStreaming({
          userId: 'intruder',
          discussionId: room.id,
          content: '끼어들기',
        })) {
          void chunk; // 스트림 시작 전에 throw 되어야 한다.
        }
      };
      await expect(iterate()).rejects.toThrow(DiscussionAccessDeniedError);
    });

    it('스트림이 도중에 실패하면 아무것도 저장하지 않는다', async () => {
      const { discussions, room, books, highlights } = await setupStartedRoom();
      // 1델타만 흘리고 실패하는 AI 로 새 유스케이스를 구성한다.
      const failingAi = new FakeAiDiscussionPartner(1);
      const useCase = new ContinueDiscussionUseCase(discussions, failingAi, books, highlights);

      const iterate = async () => {
        for await (const chunk of useCase.executeStreaming({
          userId: 'owner',
          discussionId: room.id,
          content: '실패를 유도하는 발화',
        })) {
          void chunk;
        }
      };
      await expect(iterate()).rejects.toThrow();

      // 시작 시 AI 여는 말 1개 그대로 — 사용자 발화·부분 AI 응답 모두 미저장(트랜잭션 보존).
      const found = await discussions.findById(room.id);
      expect(found?.messageCount).toBe(1);
    });
  });
});
