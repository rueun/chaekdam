import Link from 'next/link';
import { TopBar } from '@/components/layout/top-bar';
import { SectionHeader } from '@/components/layout/section-header';
import { Icon } from '@/components/ui/icon';
import { Hero } from '@/components/feature/home/hero';
import { ReadingLogPanel } from '@/components/feature/reading-log/reading-log';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';
import { WishlistCard, type WishlistBookView } from '@/components/feature/library/wishlist-card';
import { HighlightCard, type HighlightView } from '@/components/feature/highlight/highlight-card';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { ROUTES } from '@/lib/router/routes';

// 슬라이스 B 샘플 데이터 — 추후 유스케이스(읽는 중 책장 조회)로 대체
const READING_BOOKS: BookCardView[] = [
  {
    id: 'b1',
    title: '일곱 해의 마지막',
    author: '김연수',
    status: 'reading',
    coverColor: 'var(--terra-600)',
    bookmark: 142,
    lastActive: '2일 전',
  },
  {
    id: 'b2',
    title: '아주 사적인 독서',
    author: '이현우',
    status: 'reading',
    coverColor: 'var(--clay-500)',
    bookmark: 88,
    lastActive: '어제',
  },
  {
    id: 'b3',
    title: '바깥은 여름',
    author: '김애란',
    status: 'reading',
    coverColor: 'var(--talk-500)',
    bookmark: 51,
    lastActive: '3일 전',
  },
  {
    id: 'b4',
    title: '슬픔을 공부하는 슬픔',
    author: '신형철',
    status: 'reading',
    coverColor: 'var(--ink-700)',
    bookmark: 12,
    lastActive: '오늘',
  },
  {
    id: 'b5',
    title: '여름은 오래 그곳에 남아',
    author: '마쓰이에 마사시',
    status: 'reading',
    coverColor: 'var(--sage-500)',
    bookmark: 203,
    lastActive: '5일 전',
  },
];

// 최근 한 줄(Highlight) 샘플 — 추후 Highlight 조회 유스케이스로 대체
const RECENT_HIGHLIGHTS: HighlightView[] = [
  {
    id: 'h1',
    content: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
    emphasis: '어떤 문장이 자신의 것인지',
    author: '김연수',
    book: '일곱 해의 마지막',
    page: 'p.42',
  },
  {
    id: 'h2',
    content: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다. 읽는 동안에는 너무 가벼웠다.',
    emphasis: '읽는 동안에는 너무 가벼웠다.',
    author: '김애란',
    book: '바깥은 여름',
    page: 'p.94',
  },
];

// 읽고 싶은 책 샘플 — id 는 Book.id. 추후 WISH 상태 책장 조회로 대체
const WISH_ITEMS: WishlistBookView[] = [
  {
    id: 'b6',
    title: '여행의 이유',
    author: '김영하',
    coverColor: 'var(--sage-700)',
    addedAt: '5월 11일',
  },
  {
    id: 'b7',
    title: '아침의 피아노',
    author: '김진영',
    coverColor: 'var(--sage-500)',
    addedAt: '5월 3일',
  },
  { id: 'b8', title: '읽다', author: '김영하', coverColor: 'var(--ink-700)', addedAt: '4월 28일' },
];

export default function HomePage() {
  return (
    <>
      <TopBar
        title="안녕하세요, 길동님"
        subtitle="어제까지 12권 · 이번 달 3권 완독했어요"
        action={
          <Link href={ROUTES.NOTES.LIST()} className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </Link>
        }
      />

      <Hero minutesToday={24} deltaMinutes={6} />

      <ReadingLogPanel />

      <SectionHeader title="읽는 중" moreHref={ROUTES.LIBRARY()} />
      <div className="row-grid row-grid-5">
        {READING_BOOKS.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="col-grid mt-9">
        <div>
          <SectionHeader title="최근 밑줄" moreHref={ROUTES.HIGHLIGHTS()} />
          {RECENT_HIGHLIGHTS.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} />
          ))}
        </div>
        <div>
          <WishlistCard
            items={WISH_ITEMS}
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
