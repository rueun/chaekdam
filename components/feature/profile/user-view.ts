import type { User } from '@/lib/domain/user/user';

/** 클라이언트로 넘기는 직렬화 사용자 뷰(사이드바·설정·프로필 모달 공용). */
export interface CurrentUserView {
  name: string;
  email: string;
  bio: string | null;
  /** 아바타 이니셜(이름 첫 글자) */
  initial: string;
}

/** 도메인 User → plain 뷰(Server→Client 경계 평탄화). */
export function toCurrentUserView(user: User): CurrentUserView {
  return { name: user.name, email: user.email, bio: user.bio, initial: user.initial };
}
