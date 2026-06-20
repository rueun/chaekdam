'use client';

import { useRouter } from 'next/navigation';
import { Segmented } from '@/components/ui/segmented';
import { ROUTES } from '@/lib/router/routes';

/** 한 줄 목록 범위 전환 — 전체(보관 제외) / 보관함. URL 쿼리(?archived=1)로 반영. */
export function HighlightsFilter({ scope }: { scope: 'active' | 'archived' }) {
  const router = useRouter();

  return (
    <Segmented
      options={[
        { value: 'active', label: '전체' },
        { value: 'archived', label: '보관함' },
      ]}
      value={scope}
      onChange={(value) =>
        router.push(
          value === 'archived' ? `${ROUTES.HIGHLIGHTS()}?archived=1` : ROUTES.HIGHLIGHTS(),
        )
      }
    />
  );
}
