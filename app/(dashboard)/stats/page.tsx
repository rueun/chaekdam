import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { ReadingLogPanel } from '@/components/feature/reading-log/reading-log';
import { toReadingLogView } from '@/components/feature/reading-log/reading-log-view';
import {
  StatsBreakdown,
  type StatsCompletedBook,
} from '@/components/feature/stats/stats-breakdown';
import { toBookStatusKey } from '@/components/feature/library/book-status-map';
import type { BookStatusKey } from '@/components/ui/status-badge';
import {
  createAuthSession,
  createListBooksUseCase,
  createListHighlightsUseCase,
  createGetReadingLogUseCase,
} from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const [listBooks, listHighlights, getReadingLog] = await Promise.all([
    createListBooksUseCase(),
    createListHighlightsUseCase(),
    createGetReadingLogUseCase(),
  ]);
  const [books, highlights, readingLog] = await Promise.all([
    listBooks.execute(),
    listHighlights.execute(userId),
    getReadingLog.execute(userId, new Date()), // 진입점이 사용자·'오늘' 시각을 주입
  ]);

  const readingLogView = toReadingLogView(readingLog);

  // 상태별 권수 집계(표현 키로 변환). 권수·한 줄 수는 각 findAll 상한(책 500 / 한 줄 200)에
  // 영향받는다 — 본격 통계는 count 쿼리 분리 예정(TODO).
  const statusCounts: Record<BookStatusKey, number> = { reading: 0, done: 0, wish: 0, paused: 0 };
  for (const book of books) statusCounts[toBookStatusKey(book.status)] += 1;

  // 완독한 책 — 최근 담은 순. (완독 시각 필드가 없어 createdAt 기준, 날짜는 표시하지 않음.)
  const completed: StatsCompletedBook[] = books
    .filter((book) => book.status === BookStatus.DONE)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverColor: book.coverColor ?? undefined,
      coverImageUrl: book.coverImageUrl ?? undefined,
    }));
  const completedBookCount = completed.length;

  return (
    <>
      <TopBar
        title="독서 기록"
        subtitle="매일의 독서가 쌓여 한 해의 흐름이 됩니다"
        showSearch={false}
      />
      <ReadingLogPanel
        view={readingLogView}
        highlightCount={highlights.length}
        completedBookCount={completedBookCount}
      />
      <StatsBreakdown statusCounts={statusCounts} completed={completed} />
    </>
  );
}
