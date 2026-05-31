'use client';

import type { ReactNode } from 'react';
import { openBookSearch } from './book-search-modal';

/** 책 추가 모달을 여는 버튼. className 으로 외형을 주입(.btn 또는 .wish-card-foot 등). */
export function BookSearchTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={openBookSearch}>
      {children}
    </button>
  );
}
