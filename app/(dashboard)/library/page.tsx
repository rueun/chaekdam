import { TopBar } from '@/components/layout/top-bar';
import { LibraryShelf } from '@/components/feature/library/library-shelf';
import type { BookCardView } from '@/components/feature/library/book-card';
import { ROUTES } from '@/lib/router/routes';

// 샘플 책장 — 추후 책장 조회 유스케이스로 대체
const BOOKS: BookCardView[] = [
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
    title: '슬픔을 공부하는 슬픔',
    author: '신형철',
    status: 'reading',
    coverColor: 'var(--ink-700)',
    bookmark: 12,
    lastActive: '오늘',
  },
  {
    id: 'b4',
    title: '데미안',
    author: '헤르만 헤세',
    status: 'done',
    coverColor: 'var(--clay-500)',
    rating: 4.5,
    finishedAt: '5월 20일',
  },
  {
    id: 'b5',
    title: '여름은 오래 그곳에 남아',
    author: '마쓰이에 마사시',
    status: 'done',
    coverColor: 'var(--sage-500)',
    rating: 4.0,
    finishedAt: '4월 30일',
  },
  {
    id: 'b6',
    title: '소설가의 일',
    author: '김연수',
    status: 'done',
    coverColor: 'var(--talk-500)',
    rating: 5.0,
    finishedAt: '3월 12일',
  },
  {
    id: 'b7',
    title: '여행의 이유',
    author: '김영하',
    status: 'wish',
    coverColor: 'var(--sage-700)',
    startedAt: '5월 11일',
  },
  {
    id: 'b8',
    title: '아침의 피아노',
    author: '김진영',
    status: 'wish',
    coverColor: 'var(--terra-400)',
    startedAt: '5월 3일',
  },
  {
    id: 'b9',
    title: '바깥은 여름',
    author: '김애란',
    status: 'paused',
    coverColor: 'var(--talk-500)',
    startedAt: '4월 10일',
  },
  {
    id: 'b10',
    title: '읽다',
    author: '김영하',
    status: 'paused',
    coverColor: 'var(--ink-700)',
    startedAt: '2월 6일',
  },
];

export default function LibraryPage() {
  return (
    <>
      <TopBar
        title="내 서재"
        subtitle="총 10권 · 올해 3권 완독"
        action={{ label: '책 추가', href: ROUTES.BOOKS.LIST(), icon: 'plus' }}
      />
      <LibraryShelf books={BOOKS} />
    </>
  );
}
