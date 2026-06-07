import type { ReactNode } from 'react';

/**
 * 인증 화면 공통 셸 — 브랜드 마크 + 제목/부제 + 폼 슬롯. 단일 페이퍼 테마(ADR-011).
 */
export function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-paper-50 flex min-h-screen items-center justify-center p-4">
      <div className="bg-bg-elevated border-divider shadow-3 w-[min(440px,100%)] rounded-2xl border p-8">
        <div className="mb-6 flex flex-col items-center gap-1">
          <span className="text-ink-900 font-serif text-[26px] font-bold tracking-[-0.02em]">
            책담
          </span>
          <span className="text-fg-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
            Chaekdam
          </span>
        </div>
        <h1 className="text-ink-900 text-center font-serif text-[24px] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-fg-2 mt-2 mb-6 text-center text-[14px] leading-[1.6]">{sub}</p>
        {children}
      </div>
    </div>
  );
}

/** 폼 구분선 — "또는 이메일로" */
export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="bg-divider h-px flex-1" />
      <span className="text-fg-3 text-[12px]">또는 이메일로</span>
      <span className="bg-divider h-px flex-1" />
    </div>
  );
}
