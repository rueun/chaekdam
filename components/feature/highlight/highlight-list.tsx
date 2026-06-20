'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HighlightCard, type HighlightView } from './highlight-card';
import { loadMoreHighlights } from '@/app/(dashboard)/highlights/actions';
import type { HighlightScope } from '@/lib/application/list-highlights.use-case';

/**
 * 한 줄 목록 + '더보기'(ADR-025). 서버가 첫 페이지를 렌더하고, 이후 페이지는
 * loadMoreHighlights 로 받아 이어붙인다. id 로 중복 제거(revalidate·동시성 대비).
 */
export function HighlightList({
  initialItems,
  scope,
  pageSize,
}: {
  initialItems: HighlightView[];
  scope: HighlightScope;
  pageSize: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [hasMore, setHasMore] = useState(initialItems.length >= pageSize);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    void (async () => {
      const next = await loadMoreHighlights(scope, offset);
      if (!mountedRef.current) return; // 목록을 떠난 뒤 도착한 응답은 무시
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...next.filter((item) => !seen.has(item.id))];
      });
      setOffset((prev) => prev + next.length);
      setHasMore(next.length >= pageSize);
      setLoading(false);
    })();
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        {items.map((view) => (
          <HighlightCard key={view.id} highlight={view} />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loading}>
            {loading ? '불러오는 중…' : '더보기'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
