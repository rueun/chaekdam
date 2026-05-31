'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/ui/search-input';

/** 쇼케이스용 — 지우기 버튼 라이브 동작 시연 (상태 보유) */
export function SearchDemo({ pill = false }: { pill?: boolean }) {
  const [query, setQuery] = useState(pill ? '' : '데미안');
  return (
    <SearchInput
      placeholder={pill ? '상단바용 알약형' : '책 검색'}
      pill={pill}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onClear={() => setQuery('')}
    />
  );
}
