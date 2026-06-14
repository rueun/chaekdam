/**
 * 앱의 공개 origin — OAuth redirectTo 구성용.
 * 요청 헤더(x-forwarded-host 등)는 위조 가능해 신뢰하지 않고 설정값을 쓴다(오픈 리다이렉트 방지).
 * 운영에서는 NEXT_PUBLIC_SITE_URL 을 배포 도메인으로 설정한다(미설정 시 로컬 기본값).
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000';
}
