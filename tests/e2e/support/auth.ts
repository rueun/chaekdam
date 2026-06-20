import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';
import { supabaseE2eEnv } from './env';

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

let seq = 0;

/** 충돌 없는 테스트 이메일(병렬 워커 안전). */
function uniqueEmail(): string {
  seq += 1;
  return `e2e-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 8)}@test.local`;
}

/**
 * 확인 완료된 테스트 유저를 admin(service role)으로 생성한다.
 * 회원가입 폼(약관 체크박스 등)을 거치지 않아 견고하다 — 인증은 로그인 폼으로 검증.
 */
export async function createConfirmedUser(name = '테스트 독자'): Promise<TestUser> {
  const { url, serviceRoleKey } = supabaseE2eEnv();
  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = uniqueEmail();
  const password = 'e2e-password-12345';
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw new Error(`Failed to create test user: ${error.message}`);
  return { email, password, name };
}

/** 로그인 폼으로 인증하고 대시보드 진입까지 기다린다. */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  // OAuth 버튼도 '로그인' 을 포함하므로 폼 제출 버튼만 정확히 클릭.
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await page.waitForURL('**/home');
}
