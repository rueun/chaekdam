import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: '책담',
  description: '인상 깊은 구절을 사진 한 장으로 — AI와 시작하는 독서 토론',
  // app/manifest.ts 가 /manifest.webmanifest 로 자동 링크된다. 홈 화면 추가(iOS) 메타.
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '책담' },
};

// PWA 테마 색 — 딥 포레스트 그린(--terra-500). 단일 라이트(페이퍼) 테마(ADR-011).
export const viewport: Viewport = {
  themeColor: '#3f6750',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
