'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { ROUTES } from '@/lib/router/routes';

export interface WishlistTileView {
  /** Book.id */
  id: string;
  title: string;
  author: string;
  /** 표지 색 — CSS color */
  coverColor?: string;
  /** 담은 날짜 */
  addedAt: string;
  /** 담은 이유 메모 */
  note?: string;
}

type SortKey = 'recent' | 'title' | 'author';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: '최근 담은 순' },
  { key: 'title', label: '제목 가나다' },
  { key: 'author', label: '작가 가나다' },
];

/**
 * 읽고 싶은 책 그리드 — 정렬 + 타일 + 빈 상태. 정렬/제거가 클라이언트 상태라 client.
 * '책 담으러 가기' 액션은 슬롯(addBookSlot)으로 주입(book-search 결합 회피, ADR-006).
 */
export function WishlistGrid({
  initialItems,
  addBookSlot,
}: {
  initialItems: WishlistTileView[];
  addBookSlot?: ReactNode;
}) {
  // 데모: 로컬 상태로 제거만 시연. 실데이터 연동 시 Server Action(상태 전이) + revalidate 로 교체.
  const [items, setItems] = useState(initialItems);
  const [sort, setSort] = useState<SortKey>('recent');

  const sorted = useMemo(() => {
    const arr = items.slice();
    if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    if (sort === 'author') arr.sort((a, b) => a.author.localeCompare(b.author, 'ko'));
    return arr; // recent = 원본(담은 순) 순서
  }, [items, sort]);

  // 데모: 둘 다 위시 목록에선 사라지지만 의미가 다르다(읽기 시작=READING 전이 / 빼기=삭제).
  // 실연동 시 각각 startReading / removeFromWishlist 유스케이스로 교체. 구분은 토스트로 시연.
  const takeOff = (id: string) => setItems((prev) => prev.filter((b) => b.id !== id));
  const startReading = (book: WishlistTileView) => {
    takeOff(book.id);
    toast(`『${book.title}』 읽기 시작했어요`);
  };
  const removeFromWishlist = (book: WishlistTileView) => {
    takeOff(book.id);
    toast('위시리스트에서 뺐어요');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <span
          className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
          aria-hidden
        >
          <Icon name="bookmark" size={28} />
        </span>
        <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
          아직 담아둔 책이 없어요
        </div>
        <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
          서점에서 마주친 책, 추천 받은 책, 다음에 꼭 읽고 싶은 책을 여기에 담아두면 다음 읽을 책이
          비어 보이지 않아요.
        </p>
        {addBookSlot ? <div className="mt-2">{addBookSlot}</div> : null}
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 mb-5 flex flex-wrap gap-2" role="group" aria-label="정렬">
        {SORTS.map((s) => (
          <Chip key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>
            {s.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
        {sorted.map((book) => (
          <WishTile
            key={book.id}
            book={book}
            onStartReading={() => startReading(book)}
            onRemove={() => removeFromWishlist(book)}
          />
        ))}
      </div>
    </>
  );
}

function WishTile({
  book,
  onStartReading,
  onRemove,
}: {
  book: WishlistTileView;
  onStartReading: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="group border-divider bg-bg-elevated hover:border-paper-300 hover:shadow-2 flex flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5">
      <Link
        href={ROUTES.BOOKS.DETAIL(book.id)}
        aria-hidden
        tabIndex={-1}
        className="relative block aspect-video"
        style={{ background: book.coverColor ?? 'var(--ink-700)' }}
      >
        {/* '담아둠' 핀 */}
        <span className="text-talk-700 bg-paper-50/95 absolute top-3 left-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.05em] uppercase backdrop-blur-[4px]">
          담아둠
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-[18px] pt-4 pb-[18px]">
        <Link
          href={ROUTES.BOOKS.DETAIL(book.id)}
          className="text-ink-900 font-serif text-[18px] leading-[1.3] font-semibold tracking-[-0.02em] hover:underline"
        >
          {book.title}
        </Link>
        <div className="text-fg-2 mb-1.5 text-[13px]">{book.author}</div>
        {book.note ? (
          <p className="text-ink-700 my-1 line-clamp-2 font-serif text-[13px] leading-[1.55] italic">
            “{book.note}”
          </p>
        ) : null}
        <div className="text-fg-3 mt-auto pt-2.5 text-[11px] tracking-[0.02em]">
          {book.addedAt} 담음
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 justify-center"
            onClick={onStartReading}
          >
            <Icon name="book-open" size={16} />
            지금부터 읽기
          </Button>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            aria-label="위시리스트에서 빼기"
            onClick={onRemove}
          >
            <Icon name="bookmark-x" size={16} />
          </Button>
        </div>
      </div>
    </article>
  );
}
