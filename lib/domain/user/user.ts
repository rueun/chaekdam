/**
 * 사용자 — 식별자(id)로 동일성을 가지는 Entity. 이름·이메일·한 줄 소개(프로필).
 * 불변 객체. 저장소(인증 컨텍스트)에서 restore 로만 만든다.
 *
 * 프로필은 별도 테이블 없이 인증 컨텍스트(Supabase auth user_metadata)에 보관한다.
 * 매핑·기본값 보정은 Infrastructure 어댑터(toUser) 책임.
 */
export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    /** 한 줄 소개. 없으면 null. */
    readonly bio: string | null,
  ) {
    Object.freeze(this);
  }

  /**
   * 저장된(인증) 상태로 복원한다.
   * User 는 필드 간 교차 불변식이 없고(이름·이메일·소개 독립), 값 검증은 상위에서 끝난다 —
   * 입력은 application zod(이름 길이 등), 어댑터 toUser(이름 비면 폴백)가 보장한다.
   * 따라서 Highlight/ReadingSession 의 구조 불변식 재검증과 달리 restore 는 값을 신뢰한다.
   */
  static restore(props: { id: string; name: string; email: string; bio: string | null }): User {
    return new User(props.id, props.name, props.email, props.bio);
  }

  /** 아바타 이니셜 — 이름 첫 글자(서러게이트 페어 안전). 이름이 비면 '?'. */
  get initial(): string {
    const trimmed = this.name.trim();
    return trimmed.length > 0 ? [...trimmed][0]! : '?';
  }
}
