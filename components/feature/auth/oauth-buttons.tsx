'use client';

import { toast } from '@/components/ui/toast';

// 외부 브랜드 색은 디자인 토큰이 아닌 각 사 브랜드 아이덴티티라 raw 색을 사용한다.
const PROVIDERS = [
  { key: 'kakao', label: '카카오', bg: '#FEE500', fg: '#191600' },
  { key: 'naver', label: '네이버', bg: '#03C75A', fg: '#FFFFFF' },
  { key: 'google', label: 'Google', bg: '#FFFFFF', fg: '#1A1A18', border: true },
];

/**
 * 소셜 로그인 버튼 — 디자인 충실도를 위해 노출하되, 프로바이더 설정 전까지는 스텁(토스트).
 * TODO(auth): Supabase OAuth(카카오/네이버/구글) 프로바이더 연동.
 */
export function OAuthButtons({ mode }: { mode: 'login' | 'signup' }) {
  const verb = mode === 'signup' ? '시작' : '로그인';
  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => toast('소셜 로그인은 곧 제공돼요')}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold"
          style={{
            background: p.bg,
            color: p.fg,
            border: p.border ? '1px solid var(--divider-strong)' : 'none',
          }}
        >
          {p.label}로 {verb}
        </button>
      ))}
    </div>
  );
}
