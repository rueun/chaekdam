import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // setup 에서 .env.local 을 process.env 로 로드(통합 테스트의 Supabase 접속 등)
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    // 통합 테스트(*.integration.test.ts)는 로컬 Supabase 가 필요하므로 기본 실행에서 제외.
    // 전용 실행: `pnpm test:integration`.
    exclude: ['**/node_modules/**', '**/.next/**', '**/tests/e2e/**', '**/*.integration.test.ts'],
    // DB 통합 테스트는 node 환경에서 실행(jsdom fetch 등 우회) — 파일별 주석 의존 제거.
    environmentMatchGlobs: [['**/*.integration.test.ts', 'node']],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
      // 서버 전용 가드는 테스트(Node)에서 throw 하므로 no-op 으로 대체
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/server-only.ts'),
    },
  },
});
