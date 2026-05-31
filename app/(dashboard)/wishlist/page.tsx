import { TopBar } from '@/components/layout/top-bar';
import { WishlistGrid, type WishlistTileView } from '@/components/feature/library/wishlist-grid';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { Icon } from '@/components/ui/icon';

// 샘플 위시리스트 — 추후 WISH 상태 책장 조회로 대체 (id = Book.id)
const WISH_ITEMS: WishlistTileView[] = [
  {
    id: 'b6',
    title: '여행의 이유',
    author: '김영하',
    coverColor: 'var(--clay-700)',
    addedAt: '5월 11일',
    note: '오래 비행기 안에서 다시 읽고 싶어서.',
  },
  {
    id: 'b7',
    title: '아침의 피아노',
    author: '김진영',
    coverColor: 'var(--sage-700)',
    addedAt: '5월 3일',
    note: '서점에서 첫 문장만 읽고 멈췄던 책.',
  },
  { id: 'b8', title: '읽다', author: '김영하', coverColor: 'var(--ink-700)', addedAt: '4월 28일' },
  {
    id: 'b9',
    title: '소설가의 일',
    author: '김연수',
    coverColor: 'var(--talk-500)',
    addedAt: '3월 22일',
  },
  {
    id: 'b10',
    title: '문학을 읽는다는 것은',
    author: '테리 이글턴',
    coverColor: 'var(--terra-700)',
    addedAt: '2월 6일',
    note: '두 번째 시도.',
  },
];

export default function WishlistPage() {
  return (
    <>
      <TopBar
        title="읽고 싶은 책"
        subtitle={`${WISH_ITEMS.length}권 · 관심 가는 책을 모아두는 책장`}
        action={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 추가
          </BookSearchTrigger>
        }
      />
      <WishlistGrid
        initialItems={WISH_ITEMS}
        addBookSlot={
          <BookSearchTrigger className="btn btn-primary">
            <Icon name="plus" size={16} />책 담으러 가기
          </BookSearchTrigger>
        }
      />
    </>
  );
}
