'use client';

import { logError } from '@/lib/logger';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * 대시보드 라우트 에러 경계 — 페이지 렌더/데이터 오류를 사이드바 셸 안에서 친절히 복구한다.
 * 원인은 로그로만 남기고(영어), 사용자에겐 일반 메시지 + 재시도.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError('Dashboard route error', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <span
        className="bg-surface text-clay-500 grid size-16 place-content-center rounded-full"
        aria-hidden
      >
        <Icon name="alert-triangle" size={28} />
      </span>
      <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
        문제가 생겼어요
      </div>
      <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
        잠시 문제가 있었어요. 다시 시도해도 계속되면 잠시 후 다시 들러주세요.
      </p>
      <Button variant="primary" className="mt-2" onClick={reset}>
        <Icon name="refresh-cw" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
