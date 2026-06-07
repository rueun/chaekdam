/**
 * 도메인 식별자 생성. 표준 Web Crypto(`crypto.randomUUID`)만 사용해
 * 프레임워크·외부 라이브러리 의존을 두지 않는다(ADR-003).
 */
export function generateId(): string {
  return crypto.randomUUID();
}
