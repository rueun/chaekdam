import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { toCurrentUserView } from '@/components/feature/profile/user-view';
import { createAuthSession, createGetReadingLogUseCase } from '@/lib/infrastructure/di-container';

/** 대시보드(인증 후) 공통 셸 — 좌측 Sidebar + 본문. 사이드바에 사용자·오늘 분을 주입. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [authSession, getReadingLog] = await Promise.all([
    createAuthSession(),
    createGetReadingLogUseCase(),
  ]);
  const [user, readingLog] = await Promise.all([
    authSession.getCurrentUser(),
    // TODO(perf): 사이드바 '오늘 분' 때문에 전 페이지에서 세션 전건을 읽는다 — 추후 경량 집계로 분리.
    getReadingLog.execute(new Date()),
  ]);

  return (
    <div className="app">
      <Sidebar
        user={user ? toCurrentUserView(user) : null}
        minutesToday={readingLog.minutesToday}
      />
      <main className="main">{children}</main>
    </div>
  );
}
