'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router/routes';

/**
 * OAuth 마무리 — 콜백(세션 교환)이 이 페이지로 보낸다.
 * 팝업으로 열렸으면 부모 창에 결과를 알리고 닫는다. 팝업이 아니면(차단 등) 직접 이동.
 * (useSearchParams 대신 window.location 을 읽어 Suspense 경계 없이 동작.)
 */
export default function OAuthPopupCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const ok = !new URLSearchParams(window.location.search).has('error');
    const opener = window.opener as Window | null;

    if (opener && opener !== window) {
      opener.postMessage({ type: 'chaekdam-oauth', ok }, window.location.origin);
      window.close();
      return;
    }

    router.replace(ok ? ROUTES.DASHBOARD() : `${ROUTES.AUTH.LOGIN()}?error=oauth`);
  }, [router]);

  return (
    <p className="text-fg-2 grid min-h-dvh place-content-center text-[14px]">로그인 처리 중…</p>
  );
}
