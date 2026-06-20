import { test, expect } from '@playwright/test';
import { createConfirmedUser, login } from './support/auth';

test.describe('인증 · 네비게이션 스모크', () => {
  test('비로그인으로 보호 페이지에 접근하면 로그인으로 보낸다', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/);
  });

  test('로그인하면 대시보드에 인사가 보인다', async ({ page }) => {
    const user = await createConfirmedUser('테스트 독자');
    await login(page, user);
    await expect(page.getByText(`${user.name}님, 안녕하세요`)).toBeVisible();
  });

  test('로그인 직후 한 줄 목록은 비어 있다', async ({ page }) => {
    const user = await createConfirmedUser();
    await login(page, user);
    await page.goto('/highlights');
    await expect(page.getByText('아직 담은 한 줄이 없어요')).toBeVisible();
  });

  test('로그인 직후 서재는 비어 있다', async ({ page }) => {
    const user = await createConfirmedUser();
    await login(page, user);
    await page.goto('/library');
    // 서재 빈 상태 — '아직 담은 책이 없어요' 문구 노출(library-shelf 빈 상태).
    await expect(page.getByText('아직 담은 책이 없어요')).toBeVisible();
  });
});
