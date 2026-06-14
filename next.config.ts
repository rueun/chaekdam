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
};

export default nextConfig;
