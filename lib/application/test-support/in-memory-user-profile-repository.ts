import { User } from '@/lib/domain/user/user';
import type { UserProfileRepository } from '@/lib/domain/ports/user-profile-repository';

/**
 * 테스트용 In-Memory UserProfileRepository — Mock 이 아닌 진짜 갱신 동작(testing 규칙).
 * 고정 id/email 사용자의 프로필을 갱신해 반환한다.
 */
export class InMemoryUserProfileRepository implements UserProfileRepository {
  private user: User;

  constructor(initial?: { id?: string; name?: string; email?: string; bio?: string | null }) {
    this.user = User.restore({
      id: initial?.id ?? 'u1',
      name: initial?.name ?? '홍길동',
      email: initial?.email ?? 'reader@chaekdam.kr',
      bio: initial?.bio ?? null,
    });
  }

  updateProfile(input: { name: string; bio: string | null }): Promise<User> {
    this.user = User.restore({
      id: this.user.id,
      name: input.name,
      email: this.user.email,
      bio: input.bio,
    });
    return Promise.resolve(this.user);
  }
}
