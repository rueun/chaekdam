import type { Book } from '@/lib/domain/book/book';
import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';
import { OwnedBy } from '@/lib/domain/book/specs/owned-by';

/** 책 상세 화면에 필요한 한 책의 집계 데이터(도메인 객체 묶음). */
export interface BookDetailResult {
  book: Book;
  highlights: Highlight[];
  discussions: Discussion[];
  sessions: ReadingSession[];
}

/**
 * 책 상세 조회(Query) — 한 책 + 그 책의 한 줄·토론·독서 세션을 모은다(ADR-006 화면 합성).
 * 책이 없으면 null. userId 소유 범위는 한 줄·토론·세션 Repository 계약으로 명시(ADR-027).
 * (discussions/sessions 는 현재 findAll 후 bookId 필터 — 규모 커지면 Port 에 findByBookId 추가.)
 */
export class GetBookDetailUseCase {
  constructor(
    private readonly books: BookRepository,
    private readonly highlights: HighlightRepository,
    private readonly discussions: DiscussionRepository,
    private readonly sessions: ReadingSessionRepository,
  ) {}

  async execute(userId: string, bookId: string): Promise<BookDetailResult | null> {
    const book = await this.books.findById(bookId);
    // 없거나 타인 책이면 null(상세는 notFound 로 표현 — 존재 여부 비노출, ADR-027).
    if (!book || !new OwnedBy(userId).isSatisfiedBy(book)) return null;

    const [highlights, allDiscussions, allSessions] = await Promise.all([
      this.highlights.findByBookId(userId, bookId),
      this.discussions.findAll(userId),
      this.sessions.findAll(userId),
    ]);

    return {
      book,
      highlights,
      discussions: allDiscussions.filter((d) => d.bookId === bookId),
      sessions: allSessions.filter((s) => s.bookId === bookId),
    };
  }
}
