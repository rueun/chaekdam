import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfileRepository } from '@/lib/domain/ports/user-profile-repository';
import type { User } from '@/lib/domain/user/user';
import { toUser } from './user-mapper';
import type { Database } from './types.gen';

/**
 * UserProfileRepository 의 Supabase 어댑터.
 * 프로필을 인증 사용자 메타데이터(user_metadata)에 저장한다 — auth.updateUser 는
 * 현재 세션 사용자에게만 적용되므로 소유 범위가 자연히 보장된다(별도 테이블·RLS 불필요).
 */
export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async updateProfile(input: { name: string; bio: string | null }): Promise<User> {
    const { data, error } = await this.client.auth.updateUser({
      data: { name: input.name, bio: input.bio },
    });
    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    if (!data.user) throw new Error('Failed to update profile: no user returned');
    return toUser(data.user);
  }
}
