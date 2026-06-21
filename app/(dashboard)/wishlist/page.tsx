import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { WishlistGrid, type WishlistTileView } from '@/components/feature/library/wishlist-grid';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { Icon } from '@/components/ui/icon';
import { createAuthSession, createListBooksUseCase } from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

/** 날짜 → '6월 7일'(KST 고정). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

export default async function WishlistPage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const books = await (await createListBooksUseCase()).execute(userId, BookStatus.WISH);
  const items: WishlistTileView[] = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    coverColor: b.coverColor ?? undefined,
    coverImageUrl: b.coverImageUrl ?? undefined,
    addedAt: formatDateLabel(b.createdAt),
  }));

  return (
    <>
      <TopBar
        title="읽고 싶은 책"
        subtitle={
          items.length > 0
            ? `${items.length}권 · 관심 가는 책을 모아두는 책장`
            : '관심 가는 책을 모아두는 책장'
        }
        action={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 추가
          </BookSearchTrigger>
        }
      />
      <WishlistGrid
        initialItems={items}
        addBookSlot={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 담으러 가기
          </BookSearchTrigger>
        }
      />
    </>
  );
}
