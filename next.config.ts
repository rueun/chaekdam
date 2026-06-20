import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // 네이버 책 검색 썸네일 호스트(shopping-phinf / bookthumb-phinf 등 단일 레벨 *.pstatic.net).
    // 미허용 호스트는 BookCover 의 onError 폴백(색 스파인)으로 처리된다.
    remotePatterns: [{ protocol: 'https', hostname: '*.pstatic.net' }],
  },
  experimental: {
    // 사진 → 구절 추출(ADR-019): 다운스케일한 이미지 data URL 을 Server Action 으로 전송.
    // 기본 1MB 한도를 살짝 넘는 경우를 대비한 여유값(다운스케일로 대개 1MB 미만).
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
