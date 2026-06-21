import { describe, it, expect } from 'vitest';
import { GetBookDetailUseCase } from './get-book-detail.use-case';
import { InMemoryBookRepository } from './test-support/in-memory-book-repository';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { InMemoryDiscussionRepository } from './test-support/in-memory-discussion-repository';
import { InMemoryReadingSessionRepository } from './test-support/in-memory-reading-session-repository';
import { Book } from '@/lib/domain/book/book';
import { Highlight } from '@/lib/domain/highlight/highlight';
import { Discussion } from '@/lib/domain/discussion/discussion';
import { ReadingSession } from '@/lib/domain/reading-log/reading-session';

function makeUseCase() {
  const books = new InMemoryBookRepository();
  const highlights = new InMemoryHighlightRepository();
  const discussions = new InMemoryDiscussionRepository();
  const sessions = new InMemoryReadingSessionRepository();
  const useCase = new GetBookDetailUseCase(books, highlights, discussions, sessions);
  return { books, highlights, discussions, sessions, useCase };
}

describe('GetBookDetailUseCase', () => {
  it('책과 그 책의 한 줄·토론·세션만 모은다', async () => {
    const { books, highlights, discussions, sessions, useCase } = makeUseCase();
    const book = Book.register({ title: '데미안', author: '헤르만 헤세' });
    const other = Book.register({ title: '다른 책' });
    await books.save(book);
    await books.save(other);

    await highlights.save(Highlight.fromText('owner', book.id, '이 책의 한 줄'));
    await highlights.save(Highlight.fromText('owner', other.id, '다른 책 한 줄'));
    await discussions.save(
      Discussion.start({ ownerId: 'owner', bookId: book.id, personaKey: 'socrates' }).addAiMessage(
        '방',
      ),
    );
    await discussions.save(
      Discussion.start({ ownerId: 'owner', bookId: other.id, personaKey: 'critic' }).addAiMessage(
        '딴방',
      ),
    );
    await sessions.save(ReadingSession.log({ ownerId: 'owner', bookId: book.id, minutes: 30 }));
    await sessions.save(ReadingSession.log({ ownerId: 'owner', bookId: other.id, minutes: 10 }));

    const detail = await useCase.execute('owner', book.id);

    expect(detail).not.toBeNull();
    expect(detail!.book.title).toBe('데미안');
    expect(detail!.highlights).toHaveLength(1);
    expect(detail!.highlights[0]!.content).toBe('이 책의 한 줄');
    expect(detail!.discussions).toHaveLength(1);
    expect(detail!.discussions[0]!.bookId).toBe(book.id);
    expect(detail!.sessions).toHaveLength(1);
    expect(detail!.sessions[0]!.bookId).toBe(book.id);
  });

  it('같은 책에 대한 타인의 한 줄·토론·세션은 섞이지 않는다(ADR-027, RLS 없이도 소유 범위)', async () => {
    const { books, highlights, discussions, sessions, useCase } = makeUseCase();
    const book = Book.register({ title: '데미안' });
    await books.save(book);

    await highlights.save(Highlight.fromText('owner', book.id, '내 한 줄'));
    await highlights.save(Highlight.fromText('intruder', book.id, '남의 한 줄'));
    await discussions.save(
      Discussion.start({ ownerId: 'owner', bookId: book.id, personaKey: 'socrates' }).addAiMessage(
        '내 방',
      ),
    );
    await discussions.save(
      Discussion.start({ ownerId: 'intruder', bookId: book.id, personaKey: 'critic' }).addAiMessage(
        '남의 방',
      ),
    );
    await sessions.save(ReadingSession.log({ ownerId: 'owner', bookId: book.id, minutes: 30 }));
    await sessions.save(ReadingSession.log({ ownerId: 'intruder', bookId: book.id, minutes: 99 }));

    const detail = await useCase.execute('owner', book.id);
    expect(detail!.highlights.map((h) => h.content)).toEqual(['내 한 줄']);
    expect(detail!.discussions.every((d) => d.ownerId === 'owner')).toBe(true);
    expect(detail!.discussions).toHaveLength(1);
    expect(detail!.sessions.map((s) => s.minutes)).toEqual([30]); // 남의 99 분 제외
  });

  it('없는 책이면 null', async () => {
    const { useCase } = makeUseCase();
    expect(await useCase.execute('owner', 'nope')).toBeNull();
  });

  it('한 줄·토론·세션이 없어도 책만 반환한다', async () => {
    const { books, useCase } = makeUseCase();
    const book = Book.register({ title: '조용한 책' });
    await books.save(book);

    const detail = await useCase.execute('owner', book.id);
    expect(detail!.highlights).toEqual([]);
    expect(detail!.discussions).toEqual([]);
    expect(detail!.sessions).toEqual([]);
  });
});
