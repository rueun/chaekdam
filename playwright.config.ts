import { defineConfig, devices } from '@playwright/test';
import { loadEnvLocal } from './tests/e2e/support/env';

// 테스트 워커·webServer(pnpm dev) 가 Supabase 접속 정보를 갖도록 .env.local 을 로드.
// CI 는 워크플로가 env 를 직접 주입하므로 파일이 없어도 무방하다.
loadEnvLocal();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // CI 의 첫 Next 컴파일이 느릴 수 있어 여유를 둔다
  },
});
