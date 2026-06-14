import type { User } from '@/lib/domain/user/user';
import type { UserProfileRepository } from '@/lib/domain/ports/user-profile-repository';

/** 프로필 수정 명령 — 빈 소개는 null 로 정규화되어 들어온다(진입점 책임). */
export interface UpdateUserProfileCommand {
  name: string;
  bio: string | null;
}

/**
 * 프로필 수정 유스케이스 — 검증된 입력으로 현재 사용자 프로필을 갱신한다.
 * 입력 검증(이름 길이 등)은 진입점의 zod 스키마가 담당. Port 만 의존.
 *
 * 현재는 Port 위임만 하는 얇은 유스케이스다(ListHighlights 와 동일 결). 향후 인가 게이트·
 * 변경 이벤트 발행 등이 생기면 이 계층에 들어온다 — 그 자리를 유지하기 위해 둔다.
 */
export class UpdateUserProfileUseCase {
  constructor(private readonly profiles: UserProfileRepository) {}

  execute(command: UpdateUserProfileCommand): Promise<User> {
    return this.profiles.updateProfile(command);
  }
}
