import { describe, it, expect } from 'vitest';
import { StartDiscussionUseCase } from './start-discussion.use-case';
import { InMemoryDiscussionRepository } from './test-support/in-memory-discussion-repository';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { FakeAiDiscussionPartner } from './test-support/fake-ai-discussion-partner';
import { Book } from '@/lib/domain/book/book';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { BookNotFoundError, PersonaNotAvailableError } from '@/lib/domain/shared/errors';

function makeUseCase() {
  const discussions = new InMemoryDiscussionRepository();
  const ai = new FakeAiDiscussionPartner();
  const books = new InMemoryBookRepository();
  const highlights = new InMemoryHighlightRepository();
  const useCase = new StartDiscussionUseCase(discussions, ai, books, highlights);
  return { discussions, ai, books, highlights, useCase };
}

describe('StartDiscussionUseCase', () => {
  it('토론을 시작하면 첫 AI 응답이 포함된다', async () => {
    const { useCase, books } = makeUseCase();
    const book = Book.register({ title: '데미안', author: '헤르만 헤세' });
    await books.save(book);

    const room = await useCase.execute({ bookId: book.id, personaKey: 'socrates' });

    expect(room.messageCount).toBe(1);
    expect(room.lastMessage?.role).toBe('AI');
    expect(room.lastMessage?.content).toContain('소크라테스');
    expect(room.personaKey).toBe('socrates');
  });

  it('시드 한 줄을 컨텍스트로 넘기고 방 제목으로 삼는다', async () => {
    const { useCase, books, highlights, ai } = makeUseCase();
    const book = Book.register({ title: '데미안', author: '헤르만 헤세' });
    await books.save(book);
    const highlight = Highlight.fromText(book.id, '새는 알에서 나오려고 투쟁한다');
    await highlights.save(highlight);

    const room = await useCase.execute({
      bookId: book.id,
      personaKey: 'critic',
      seedHighlightId: highlight.id,
    });

    expect(room.seedHighlightId).toBe(highlight.id);
    expect(room.title).toContain('새는 알에서');
    expect(ai.lastContext?.seedHighlight).toBe('새는 알에서 나오려고 투쟁한다');
    expect(ai.lastContext?.book.title).toBe('데미안');
  });

  it('저장되어 다시 조회된다', async () => {
    const { useCase, discussions, books } = makeUseCase();
    const book = Book.register({ title: '데미안' });
    await books.save(book);

    const room = await useCase.execute({ bookId: book.id, personaKey: 'friend' });
    const found = await discussions.findById(room.id);

    expect(found?.messageCount).toBe(1);
  });

  it('없는 책으로는 시작할 수 없다', async () => {
    const { useCase } = makeUseCase();
    await expect(useCase.execute({ bookId: 'nope', personaKey: 'socrates' })).rejects.toThrow(
      BookNotFoundError,
    );
  });

  it('가용하지 않은 페르소나(작가 본인)는 거부한다', async () => {
    const { useCase, books } = makeUseCase();
    const book = Book.register({ title: '데미안' });
    await books.save(book);

    await expect(useCase.execute({ bookId: book.id, personaKey: 'author' })).rejects.toThrow(
      PersonaNotAvailableError,
    );
  });

  it('지정한 시드 한 줄이 없으면 시드 없이 진행한다(FK 안전)', async () => {
    const { useCase, books } = makeUseCase();
    const book = Book.register({ title: '데미안' });
    await books.save(book);

    const room = await useCase.execute({
      bookId: book.id,
      personaKey: 'socrates',
      seedHighlightId: 'deleted-highlight',
    });

    expect(room.seedHighlightId).toBeNull();
  });
});
