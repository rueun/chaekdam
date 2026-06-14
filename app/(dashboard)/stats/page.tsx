import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { ReadingLogPanel } from '@/components/feature/reading-log/reading-log';
import { toReadingLogView } from '@/components/feature/reading-log/reading-log-view';
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
    listHighlights.execute(),
    getReadingLog.execute(new Date()), // 진입점이 '오늘' 시각을 주입
  ]);

  const readingLogView = toReadingLogView(readingLog);
  // 완독 권수·한 줄 수는 각 findAll 상한(책 500 / 한 줄 200)에 영향받는다 — 본격 통계는 count 분리 예정(TODO).
  const completedBookCount = books.filter((b) => b.status === BookStatus.DONE).length;

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
      {/* TODO(stats): 연간 히트맵 · 장르 분포 · 완독 타임라인 등 확장 예정 */}
    </>
  );
}
