import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import {
  ReadingSessionPanel,
  type ReadingBookView,
} from '@/components/feature/reader/reading-session-panel';
import { createAuthSession, createListBooksUseCase } from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

export default async function ReadingPage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const books = await (await createListBooksUseCase()).execute(BookStatus.READING);
  const readingBooks: ReadingBookView[] = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverColor: book.coverColor ?? undefined,
    coverImageUrl: book.coverImageUrl ?? undefined,
  }));

  return (
    <>
      <TopBar title="읽기" subtitle="타이머로 읽은 시간을 기록해요" showSearch={false} />
      <ReadingSessionPanel books={readingBooks} />
    </>
  );
}
