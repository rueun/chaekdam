'use client';

import { useState, type ReactNode } from 'react';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';
import type { BookStatusKey } from '@/components/ui/status-badge';
import { ROUTES } from '@/lib/router/routes';

type FilterKey = 'all' | BookStatusKey;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'reading', label: '읽는 중' },
  { key: 'done', label: '완독' },
  { key: 'wish', label: '읽고 싶은' },
  { key: 'paused', label: '쉬는 중' },
];

/**
 * 책장 — 상태 필터 칩 + 책 그리드. 필터 상태를 보유하므로 클라이언트 컴포넌트.
 * (목업의 '밑줄만' 필터는 Highlight 데이터가 생기면 추가 예정.)
 */
export function LibraryShelf({
  books,
  addBookSlot,
}: {
  books: BookCardView[];
  /** 빈 책장에서 보여줄 '책 추가' 액션 슬롯(book-search 결합 회피, ADR-006) */
  addBookSlot?: ReactNode;
}) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const visible = filter === 'all' ? books : books.filter((b) => b.status === filter);
  const shelfEmpty = books.length === 0; // 책장 자체가 빔 vs 필터만 빔 구분

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="상태 필터">
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div aria-live="polite">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span
              className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
              aria-hidden
            >
              <Icon name={shelfEmpty ? 'library' : 'book-open'} size={28} />
            </span>
            <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
              {shelfEmpty ? '아직 담은 책이 없어요' : '이 책장엔 아직 책이 없어요'}
            </div>
            <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
              {shelfEmpty
                ? '읽고 있는 책, 완독한 책, 읽고 싶은 책을 담아 나만의 서재를 채워보세요.'
                : '다른 책장을 둘러보거나 새 책을 담아보세요.'}
            </p>
            <div className="mt-2">
              {shelfEmpty ? addBookSlot : <Chip onClick={() => setFilter('all')}>전체 보기</Chip>}
            </div>
          </div>
        ) : (
          <div className="row-grid row-grid-5">
            {visible.map((book) => (
              <BookCard key={book.id} book={book} href={ROUTES.BOOKS.DETAIL(book.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
