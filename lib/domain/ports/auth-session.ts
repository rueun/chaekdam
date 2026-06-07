/**
 * 현재 사용자 식별 Port — 도메인이 정의하는 인증 컨텍스트 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(예: SupabaseAuthSession).
 * 진입점·유스케이스는 이 인터페이스로만 "현재 누구인지"를 묻는다.
 */
export interface AuthSession {
  /** 현재 로그인 사용자 ID. 비로그인이면 null. */
  getCurrentUserId(): Promise<string | null>;
}
