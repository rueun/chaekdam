import 'server-only';
import {
  createListBooksUseCase,
  createListHighlightsUseCase,
} from '@/lib/infrastructure/di-container';
import type { HighlightScope } from '@/lib/application/list-highlights.use-case';
import type { HighlightView } from '@/components/feature/highlight/highlight-card';

/** '더보기' 한 페이지 크기(ADR-025). */
export const HIGHLIGHTS_PAGE_SIZE = 30;

/** 날짜 → '6월 7일' 라벨(KST 고정 — 서버 TZ 영향 제거). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

/**
 * 한 줄 목록 한 페이지를 책 메타로 보강해 뷰로 만든다(페이지·더보기 액션 공용).
 * 여러 도메인 조합(한 줄 × 책)은 화면 계층에서 합친다(ADR-006).
 */
export async function loadHighlightViews(
  userId: string,
  scope: HighlightScope,
  page: { limit: number; offset: number },
): Promise<HighlightView[]> {
  const [listHighlights, listBooks] = await Promise.all([
    createListHighlightsUseCase(),
    createListBooksUseCase(),
  ]);
  const [highlights, books] = await Promise.all([
    listHighlights.execute(userId, scope, page),
    listBooks.execute(),
  ]);

  const bookById = new Map(books.map((b) => [b.id, b]));
  return highlights.map((h) => {
    const book = bookById.get(h.bookId);
    const author = book?.author?.trim() ? book.author : undefined;
    return {
      id: h.id,
      content: h.content,
      author,
      book: book?.title,
      page: h.page ?? undefined,
      dateLabel: formatDateLabel(h.createdAt),
      photoUrl: h.photoUrl ?? undefined,
      pinned: h.pinned,
      archived: h.archived,
      tags: [...h.tags],
    };
  });
}
