import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthSession } from '@/lib/domain/ports/auth-session';
import type { User } from '@/lib/domain/user/user';
import { toUser } from './user-mapper';
import type { Database } from './types.gen';

/**
 * AuthSession 의 Supabase 어댑터. 주입된 요청 범위 클라이언트로 현재 사용자를 조회한다.
 * getUser() 는 토큰을 서버에서 검증한다(getSession 보다 안전).
 */
export class SupabaseAuthSession implements AuthSession {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    return user?.id ?? null;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    return user ? toUser(user) : null;
  }
}
