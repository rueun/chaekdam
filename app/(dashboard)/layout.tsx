import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

/** 대시보드(인증 후) 공통 셸 — 좌측 Sidebar + 본문. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
