'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { signInWithGoogle } from '@/app/(auth)/actions';
import { ROUTES } from '@/lib/router/routes';

// 외부 브랜드 색은 디자인 토큰이 아닌 각 사 브랜드 아이덴티티라 raw 색을 사용한다.
const PROVIDERS = [
  { key: 'kakao', label: '카카오', bg: '#FEE500', fg: '#191600', border: false },
  { key: 'naver', label: '네이버', bg: '#03C75A', fg: '#FFFFFF', border: false },
  { key: 'google', label: 'Google', bg: '#FFFFFF', fg: '#1A1A18', border: true },
] as const;

const POPUP_FEATURES = 'popup,width=480,height=720';

/**
 * 소셜 로그인 버튼. 구글은 Supabase OAuth 를 팝업 창으로 진행한다(차단 시 현재 탭으로 폴백).
 * 팝업이 로그인 완료 후 부모(이 창)에 postMessage 로 알리면 홈으로 이동한다.
 * 카카오/네이버는 프로바이더 설정 전까지 스텁(토스트).
 */
export function OAuthButtons({ mode }: { mode: 'login' | 'signup' }) {
  const verb = mode === 'signup' ? '시작' : '로그인';
  const router = useRouter();
  const [pending, setPending] = useState(false);

  // 팝업(/auth/popup-complete)이 보내는 완료 메시지를 수신.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; ok?: boolean } | null;
      if (data?.type !== 'chaekdam-oauth') return;
      setPending(false);
      if (data.ok) {
        router.replace(ROUTES.DASHBOARD());
        router.refresh();
      } else {
        toast('구글 로그인에 실패했어요. 다시 시도해 주세요.');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  const onGoogle = () => {
    if (pending) return;
    setPending(true);
    // 팝업은 클릭 핸들러에서 동기로 열어야 차단되지 않는다(URL 은 이후 주입).
    const popup = window.open('', 'chaekdam-google-login', POPUP_FEATURES);
    void (async () => {
      const result = await signInWithGoogle();
      if ('error' in result) {
        popup?.close();
        toast(result.error);
        setPending(false);
        return;
      }
      if (popup && !popup.closed) {
        popup.location.href = result.url;
      } else {
        // 팝업 차단 → 현재 탭에서 진행(완료 후 popup-complete 가 홈으로 이동).
        window.location.href = result.url;
      }
    })();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.key}
          type="button"
          disabled={pending}
          onClick={p.key === 'google' ? onGoogle : () => toast('소셜 로그인은 곧 제공돼요')}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold disabled:opacity-60"
          style={{
            background: p.bg,
            color: p.fg,
            border: p.border ? '1px solid var(--divider-strong)' : 'none',
          }}
        >
          {p.key === 'google' && pending ? '로그인 창 대기 중…' : `${p.label}로 ${verb}`}
        </button>
      ))}
    </div>
  );
}
