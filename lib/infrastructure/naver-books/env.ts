import 'server-only';

/** 네이버 책 검색 API 자격 — 서버 전용. 누락 시 명확히 실패시킨다(호출 시점). */
export function naverBookCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.NAVER_BOOK_CLIENT_ID;
  const clientSecret = process.env.NAVER_BOOK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Naver book API credentials: NAVER_BOOK_CLIENT_ID / NAVER_BOOK_CLIENT_SECRET',
    );
  }
  return { clientId, clientSecret };
}
