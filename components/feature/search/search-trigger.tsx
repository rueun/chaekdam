'use client';

import { cn } from '@/lib/utils/cn';
import { openSearch } from './search-dialog';

/**
 * 상단바 검색 트리거 — 검색창 모양의 버튼. 클릭하면 전체 검색 모달을 연다.
 * (INTERACTIONS: TopBar 검색창 클릭 → 전체 검색 모달)
 */
export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="전체 검색 열기"
      aria-haspopup="dialog"
      className={cn(
        'search text-fg-3 w-72 cursor-pointer text-left text-[13px] font-medium',
        className,
      )}
    >
      책, 작가, 밑줄 검색
    </button>
  );
}
