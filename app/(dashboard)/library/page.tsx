import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { LibraryShelf } from '@/components/feature/library/library-shelf';
import type { BookCardView } from '@/components/feature/library/book-card';
import { toBookStatusKey } from '@/components/feature/library/book-status-map';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { Icon } from '@/components/ui/icon';
import { createAuthSession, createListBooksUseCase } from '@/lib/infrastructure/di-container';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const books = await (await createListBooksUseCase()).execute();
  // 도메인 Book → 카드 뷰모델. 별점·북마크 등 풍부한 메타는 ReadingLog 도입 후 연결.
  const views: BookCardView[] = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    status: toBookStatusKey(b.status),
    coverColor: b.coverColor ?? undefined,
    coverImageUrl: b.coverImageUrl ?? undefined,
  }));

  return (
    <>
      <TopBar
        title="내 서재"
        subtitle={views.length > 0 ? `총 ${views.length}권` : '책을 담아 책장을 채워보세요'}
        action={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 추가
          </BookSearchTrigger>
        }
      />
      <LibraryShelf
        books={views}
        addBookSlot={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 추가
          </BookSearchTrigger>
        }
      />
    </>
  );
}
