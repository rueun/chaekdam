import { describe, it, expect } from 'vitest';
import { ContinueDiscussionUseCase } from './continue-discussion.use-case';
import { StartDiscussionUseCase } from './start-discussion.use-case';
import { InMemoryDiscussionRepository } from './test-support/in-memory-discussion-repository';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { FakeAiDiscussionPartner } from './test-support/fake-ai-discussion-partner';
import { Book } from '@/lib/domain/book/book';
import { DiscussionNotFoundError } from '@/lib/domain/shared/errors';

async function setupStartedRoom() {
  const discussions = new InMemoryDiscussionRepository();
  const ai = new FakeAiDiscussionPartner();
  const books = new InMemoryBookRepository();
  const highlights = new InMemoryHighlightRepository();
  const book = Book.register({ title: '데미안', author: '헤르만 헤세' });
  await books.save(book);
  const room = await new StartDiscussionUseCase(discussions, ai, books, highlights).execute({
    bookId: book.id,
    personaKey: 'socrates',
  });
  const continueUseCase = new ContinueDiscussionUseCase(discussions, ai, books, highlights);
  return { discussions, ai, continueUseCase, room };
}

describe('ContinueDiscussionUseCase', () => {
  it('사용자 발화 후 AI 응답이 더해진다', async () => {
    const { continueUseCase, room } = await setupStartedRoom();

    const updated = await continueUseCase.execute({
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

    await continueUseCase.execute({ discussionId: room.id, content: '안녕하세요' });

    // 여는 말(AI) + 방금 사용자 발화 = 2턴이 컨텍스트로 전달됨
    expect(ai.lastContext?.history).toHaveLength(2);
    expect(ai.lastContext?.history.at(-1)).toEqual({ role: 'USER', content: '안녕하세요' });
  });

  it('변경이 저장되어 다시 조회된다', async () => {
    const { continueUseCase, discussions, room } = await setupStartedRoom();

    await continueUseCase.execute({ discussionId: room.id, content: '한 번 더' });
    const found = await discussions.findById(room.id);

    expect(found?.messageCount).toBe(3);
  });

  it('없는 토론은 이어갈 수 없다', async () => {
    const { continueUseCase } = await setupStartedRoom();
    await expect(continueUseCase.execute({ discussionId: 'nope', content: '...' })).rejects.toThrow(
      DiscussionNotFoundError,
    );
  });
});
