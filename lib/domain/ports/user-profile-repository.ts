import type { User } from '@/lib/domain/user/user';

/**
 * 프로필 갱신 Port — 도메인이 정의하는 프로필 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(SupabaseUserProfileRepository).
 * 대상은 현재 인증 컨텍스트의 사용자(소유 범위는 Adapter 가 보장).
 * 조회는 이 Port 가 아니라 AuthSession.getCurrentUser() 를 사용한다(인증·프로필 컨텍스트 분리).
 */
export interface UserProfileRepository {
  /** 현재 사용자의 프로필(이름·한 줄 소개)을 갱신하고 갱신된 사용자를 반환한다. */
  updateProfile(input: { name: string; bio: string | null }): Promise<User>;
}
