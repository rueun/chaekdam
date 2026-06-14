'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/toast';
import { signInWithGoogle } from '@/app/(auth)/actions';

// 외부 브랜드 색은 디자인 토큰이 아닌 각 사 브랜드 아이덴티티라 raw 색을 사용한다.
const PROVIDERS = [
  { key: 'kakao', label: '카카오', bg: '#FEE500', fg: '#191600', border: false },
  { key: 'naver', label: '네이버', bg: '#03C75A', fg: '#FFFFFF', border: false },
  { key: 'google', label: 'Google', bg: '#FFFFFF', fg: '#1A1A18', border: true },
] as const;

/**
 * 소셜 로그인 버튼. 구글은 Supabase OAuth 로 연동(성공 시 액션이 리다이렉트).
 * 카카오/네이버는 프로바이더 설정 전까지 스텁(토스트).
 */
export function OAuthButtons({ mode }: { mode: 'login' | 'signup' }) {
  const verb = mode === 'signup' ? '시작' : '로그인';
  const [pending, setPending] = useState(false);

  const onGoogle = () => {
    if (pending) return;
    setPending(true);
    void (async () => {
      const result = await signInWithGoogle();
      // 성공이면 액션이 리다이렉트하므로 여기 도달하지 않는다. 에러만 처리.
      if (result?.error) {
        toast(result.error);
        setPending(false);
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
          {p.key === 'google' && pending ? '이동 중…' : `${p.label}로 ${verb}`}
        </button>
      ))}
    </div>
  );
}
