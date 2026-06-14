import 'server-only';
import type { BookSearcher, BookSearchHit } from '@/lib/domain/ports/book-searcher';
import { toBookSearchHits, type NaverBookResponse } from './naver-book-mapper';

const ENDPOINT = 'https://openapi.naver.com/v1/search/book.json';
const DISPLAY = 20;
const TIMEOUT_MS = 5000;

/**
 * BookSearcher 의 네이버 어댑터(ADR-005). 네이버 책 검색 OpenAPI 를 호출하고 응답을
 * BookSearchHit 으로 매핑한다. 키는 서버 전용 헤더로만 전달(클라이언트 노출 없음).
 * 규격: docs/naver-book-search-api.md
 */
export class NaverBookSearcher implements BookSearcher {
  constructor(private readonly credentials: { clientId: string; clientSecret: string }) {}

  async search(query: string): Promise<BookSearchHit[]> {
    const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&display=${DISPLAY}`;
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': this.credentials.clientId,
        'X-Naver-Client-Secret': this.credentials.clientSecret,
      },
      // 검색은 매번 최신 — 캐시하지 않는다. 무응답 시 매달리지 않도록 타임아웃.
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      // 401(자격)·429(쿼터) 등은 상태로만 구분 — 로그 추적성 위해 statusText 포함.
      throw new Error(`Naver book search failed: ${response.status} ${response.statusText}`);
    }
    let data: NaverBookResponse;
    try {
      data = (await response.json()) as NaverBookResponse;
    } catch (error) {
      throw new Error('Naver book search: invalid JSON response', { cause: error });
    }
    return toBookSearchHits(data);
  }
}
