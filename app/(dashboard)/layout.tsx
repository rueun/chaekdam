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
  const user = await authSession.getCurrentUser();
  // TODO(perf): 사이드바 '오늘 분' 때문에 전 페이지에서 세션 전건을 읽는다 — 추후 경량 집계로 분리.
  // 미인증이면 빈 userId 로 조회하지 않고 0 으로 둔다(불필요한 쿼리·오노출 방지, ADR-027).
  const minutesToday = user ? (await getReadingLog.execute(user.id, new Date())).minutesToday : 0;

  return (
    <div className="app">
      <Sidebar user={user ? toCurrentUserView(user) : null} minutesToday={minutesToday} />
      <main className="main">{children}</main>
    </div>
  );
}
