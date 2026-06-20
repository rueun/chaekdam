import type { MetadataRoute } from 'next';

/**
 * PWA 매니페스트(ADR-024) — 설치형 앱 메타. 색은 디자인 토큰과 일치
 * (theme=딥 포레스트 그린 --terra-500, bg=페이퍼 --paper-50).
 * 아이콘은 브랜드 SVG 플레이스홀더 — 래스터(PNG 192/512) 에셋은 후속.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '책담',
    short_name: '책담',
    description: '인상 깊은 구절을 사진 한 장으로 — AI와 시작하는 독서 토론',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f2',
    theme_color: '#3f6750',
    lang: 'ko',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
