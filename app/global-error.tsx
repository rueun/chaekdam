'use client';

import { logError } from '@/lib/logger';
import { useEffect } from 'react';

/**
 * 전역 에러 경계 — 루트 레이아웃 자체가 실패할 때만 동작한다(앱 셸을 대체하므로 자체 html/body).
 * 디자인 시스템 로드를 보장 못 하므로 인라인 스타일로 최소 복구 UI 를 그린다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError('Global error', error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
          background: '#faf8f2',
          color: '#1a1a18',
          fontFamily: 'Pretendard, system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>문제가 생겼어요</h1>
        <p style={{ fontSize: 14, color: '#5e5c53', margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
          앱을 불러오는 중 문제가 있었어요. 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            padding: '10px 18px',
            borderRadius: 999,
            border: 'none',
            background: '#3f6750',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
