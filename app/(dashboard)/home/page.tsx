import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { SectionHeader } from '@/components/layout/section-header';
import { Icon } from '@/components/ui/icon';
import { Hero } from '@/components/feature/home/hero';
import { ReadingLogPanel } from '@/components/feature/reading-log/reading-log';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';
import { WishlistCard, type WishlistBookView } from '@/components/feature/library/wishlist-card';
import { HighlightCard, type HighlightView } from '@/components/feature/highlight/highlight-card';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { CaptureTrigger } from '@/components/feature/capture/capture-trigger';
import { toBookStatusKey } from '@/components/feature/library/book-status-map';
import {
  createAuthSession,
  createListBooksUseCase,
  createListHighlightsUseCase,
} from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

const READING_PREVIEW = 5;
const HIGHLIGHT_PREVIEW = 2;
const WISH_PREVIEW = 3;

/** 날짜 → '6월 7일'(KST 고정). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

export default async function HomePage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const [listBooks, listHighlights] = await Promise.all([
    createListBooksUseCase(),
    createListHighlightsUseCase(),
  ]);
  const [books, highlights] = await Promise.all([listBooks.execute(), listHighlights.execute()]);

  const readingBooks: BookCardView[] = books
    .filter((b) => b.status === BookStatus.READING)
    .slice(0, READING_PREVIEW)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      status: toBookStatusKey(b.status),
      coverColor: b.coverColor ?? undefined,
    }));

  const wishItems: WishlistBookView[] = books
    .filter((b) => b.status === BookStatus.WISH)
    .slice(0, WISH_PREVIEW)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverColor: b.coverColor ?? undefined,
      addedAt: formatDateLabel(b.createdAt),
    }));

  // 최근 한 줄 — 책 메타(저자·제목)로 보강
  const bookById = new Map(books.map((b) => [b.id, b]));
  const recentHighlights: HighlightView[] = highlights.slice(0, HIGHLIGHT_PREVIEW).map((h) => {
    // 책이 삭제된 한 줄이면 book 이 없어 출처(저자·제목) 없이 표시된다(의도된 폴백).
    const book = bookById.get(h.bookId);
    return {
      id: h.id,
      content: h.content,
      author: book?.author?.trim() ? book.author : undefined,
      book: book?.title,
      page: h.page ?? undefined,
      dateLabel: formatDateLabel(h.createdAt),
    };
  });

  return (
    <>
      {/* TODO(profile): 사용자 프로필 연동 후 이름 포함 인사말로 교체 */}
      <TopBar
        title="안녕하세요"
        subtitle="오늘도 한 줄 담아볼까요"
        action={
          <CaptureTrigger className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </CaptureTrigger>
        }
      />

      {/* TODO(reading-log): Hero 통계·ReadingLogPanel 은 ReadingLog 도메인 연동 전 샘플값 */}
      <Hero
        minutesToday={24}
        deltaMinutes={6}
        captureActions={
          <>
            <CaptureTrigger className="btn btn-secondary">
              <Icon name="camera" size={16} />
              문구 촬영
            </CaptureTrigger>
            <CaptureTrigger className="btn btn-secondary">
              <Icon name="image-up" size={16} />
              이미지 업로드
            </CaptureTrigger>
          </>
        }
      />

      <ReadingLogPanel />

      <SectionHeader title="읽는 중" moreHref={ROUTES.LIBRARY()} />
      {readingBooks.length > 0 ? (
        <div className="row-grid row-grid-5">
          {readingBooks.map((book) => (
            <BookCard key={book.id} book={book} href={ROUTES.BOOKS.DETAIL(book.id)} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-fg-2">
          읽는 중인 책이 없어요.{' '}
          <Link href={ROUTES.LIBRARY()} className="text-accent font-semibold hover:underline">
            서재에서 책 펴보기
          </Link>
        </p>
      )}

      <div className="col-grid mt-9">
        <div>
          <SectionHeader title="최근 밑줄" moreHref={ROUTES.HIGHLIGHTS()} />
          {recentHighlights.length > 0 ? (
            recentHighlights.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))
          ) : (
            <p className="text-body-sm text-fg-2">아직 담은 한 줄이 없어요.</p>
          )}
        </div>
        <div>
          <WishlistCard
            items={wishItems}
            footAction={
              <BookSearchTrigger className="wish-card-foot">
                <Icon name="plus" size={16} />책 더 담기
              </BookSearchTrigger>
            }
          />
        </div>
      </div>
    </>
  );
}
