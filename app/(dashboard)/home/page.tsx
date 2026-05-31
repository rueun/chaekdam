import { TopBar } from '@/components/layout/top-bar';
import { SectionHeader } from '@/components/layout/section-header';
import { Hero } from '@/components/feature/home/hero';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';
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

export default function HomePage() {
  return (
    <>
      <TopBar
        title="안녕하세요, 길동님"
        subtitle="어제까지 12권 · 이번 달 3권 완독했어요"
        action={{ label: '한 줄 담기', href: ROUTES.NOTES.LIST(), icon: 'pen-line' }}
      />

      <Hero minutesToday={24} deltaMinutes={6} />

      <SectionHeader title="읽는 중" moreHref={ROUTES.LIBRARY()} />
      <div className="row-grid row-grid-5">
        {READING_BOOKS.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
}
