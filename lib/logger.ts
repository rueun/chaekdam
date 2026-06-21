/**
 * 서버 에러 로깅 단일 진입점.
 * 흩어진 `console.error` 대신 이 seam 을 거치게 해, 후일 pino·Sentry 등으로
 * 한 곳에서 교체할 수 있게 한다(운영 모니터링 호환을 위해 메시지는 영어).
 */
export function logError(context: string, error: unknown): void {
  // 현재 구현은 console — 추후 구조화 로거로 대체할 단일 지점.

  console.error(context, error);
}
