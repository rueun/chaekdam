// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { createSupabaseAdminClient } from './admin-client';
import { supabaseEnv } from './env';
import { SupabaseAuthSession } from './supabase-auth-session';
import { SupabaseUserProfileRepository } from './supabase-user-profile-repository';

// 로컬 Supabase 필요. auth user_metadata 왕복을 실제로 검증(Mock 금지).

describe('Supabase 프로필 (통합)', () => {
  const admin = createSupabaseAdminClient();
  const password = 'test-password-12345';
  const email = `profile-${crypto.randomUUID()}@test.local`;
  let userId: string;
  let client: SupabaseClient<Database>;

  beforeAll(async () => {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: '홍길동' },
    });
    if (created.error) throw created.error;
    userId = created.data.user.id;

    const { url, anonKey } = supabaseEnv();
    client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  });

  afterAll(async () => {
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it('getCurrentUser 가 메타데이터의 이름과 이메일을 도메인 User 로 매핑한다', async () => {
    const user = await new SupabaseAuthSession(client).getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).toBe(userId);
    expect(user!.name).toBe('홍길동');
    expect(user!.email).toBe(email);
    expect(user!.bio).toBeNull(); // 가입 시 소개 없음
    expect(user!.initial).toBe('홍');
  });

  it('updateProfile 이 이름·소개를 메타데이터에 저장하고 다시 조회된다', async () => {
    const repo = new SupabaseUserProfileRepository(client);
    const updated = await repo.updateProfile({ name: '김독서', bio: '종이책 애호가' });
    expect(updated.name).toBe('김독서');
    expect(updated.bio).toBe('종이책 애호가');

    // 같은 세션으로 다시 조회해도 반영돼 있어야 한다.
    const reread = await new SupabaseAuthSession(client).getCurrentUser();
    expect(reread!.name).toBe('김독서');
    expect(reread!.bio).toBe('종이책 애호가');
  });
});
