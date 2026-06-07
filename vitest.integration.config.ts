import { defineConfig } from 'vitest/config';
import path from 'node:path';

// 통합 테스트 전용 — 로컬 Supabase(`supabase start`) 필요. 실행: `pnpm test:integration`.
// 기본 `pnpm test`(단위)에서는 제외되므로 CI/오프라인에서 단위 테스트가 막히지 않는다.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.integration.test.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
      // 서버 전용 가드는 테스트(Node)에서 throw 하므로 no-op 으로 대체
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/server-only.ts'),
    },
  },
});
