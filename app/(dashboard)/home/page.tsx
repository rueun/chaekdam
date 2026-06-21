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
import { OnboardingGuide } from '@/components/feature/onboarding/onboarding-guide';
import { toBookStatusKey } from '@/components/feature/library/book-status-map';
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
  const currentUser = await (await createAuthSession()).getCurrentUser();
  if (!currentUser) redirect(ROUTES.AUTH.LOGIN());

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

  // 신규 사용자(책·한 줄 0) — 온보딩 가이드 노출. 첫 행동 후 데이터가 생기면 자연 소멸(ADR-026).
  const isNewUser = books.length === 0 && highlights.length === 0;

  const readingLogView = toReadingLogView(readingLog);
  // 완독 권수: 책장 전체에서 집계(현재 findAll 상한 500). 한 줄 수도 한 줄 findAll 상한(200)에
  // 영향받는다 — MVP 규모에선 무방하나, 본격 통계는 count 쿼리로 분리 예정(TODO).
  const completedBookCount = books.filter((b) => b.status === BookStatus.DONE).length;

  const readingBooks: BookCardView[] = books
    .filter((b) => b.status === BookStatus.READING)
    .slice(0, READING_PREVIEW)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      status: toBookStatusKey(b.status),
      coverColor: b.coverColor ?? undefined,
      coverImageUrl: b.coverImageUrl ?? undefined,
    }));

  const wishItems: WishlistBookView[] = books
    .filter((b) => b.status === BookStatus.WISH)
    .slice(0, WISH_PREVIEW)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverColor: b.coverColor ?? undefined,
      coverImageUrl: b.coverImageUrl ?? undefined,
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
      photoUrl: h.photoUrl ?? undefined,
      pinned: h.pinned,
      archived: h.archived,
      tags: [...h.tags],
    };
  });

  return (
    <>
      <TopBar
        title={`${currentUser.name}님, 안녕하세요`}
        subtitle="오늘도 한 줄 담아볼까요"
        action={
          <CaptureTrigger className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </CaptureTrigger>
        }
      />

      {isNewUser ? <OnboardingGuide userName={currentUser.name} /> : null}

      <Hero
        minutesToday={readingLogView.minutesToday}
        deltaMinutes={readingLogView.deltaMinutes}
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

      <ReadingLogPanel
        view={readingLogView}
        highlightCount={highlights.length}
        completedBookCount={completedBookCount}
      />

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
