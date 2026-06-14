import 'server-only';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User } from '@/lib/domain/user/user';

/**
 * Supabase 인증 사용자 → 도메인 User 매핑.
 * 프로필(name·bio)은 user_metadata 에 보관한다(별도 테이블 없음).
 * 구버전 계정 등 name 이 비어 있으면 이메일 로컬파트로 폴백해 이름이 항상 존재하도록 한다.
 */
export function toUser(authUser: SupabaseAuthUser): User {
  const meta = authUser.user_metadata ?? {};
  const email = authUser.email ?? '';
  const rawName = typeof meta.name === 'string' ? meta.name.trim() : '';
  const name = rawName.length > 0 ? rawName : (email.split('@')[0] ?? '') || '사용자';
  const rawBio = typeof meta.bio === 'string' ? meta.bio.trim() : '';
  const bio = rawBio.length > 0 ? rawBio : null;
  return User.restore({ id: authUser.id, name, email, bio });
}
