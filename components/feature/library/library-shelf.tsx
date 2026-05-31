'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';
import type { BookStatusKey } from '@/components/ui/status-badge';

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
export function LibraryShelf({ books }: { books: BookCardView[] }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const visible = filter === 'all' ? books : books.filter((b) => b.status === filter);

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
          <p className="text-body-sm text-fg-2">해당하는 책이 없어요.</p>
        ) : (
          <div className="row-grid row-grid-5">
            {visible.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
