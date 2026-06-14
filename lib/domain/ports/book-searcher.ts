/**
 * 외부 도서 검색 결과 한 건 — 외부 카탈로그(네이버 등)에서 온 메타. 도메인 Book 엔티티가 아니다.
 * 책장에 담을 때 이 중 일부(title·author)만 Book 으로 옮긴다.
 */
export interface BookSearchHit {
  /** ISBN(13자리 우선). 없으면 빈 문자열. */
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  /** 출간 연도(YYYY). 모르면 빈 문자열. */
  publishedYear: string;
  description: string;
  /** 표지 썸네일 URL(외부). 표시에 쓰지 않을 수 있음. */
  imageUrl: string;
}

/**
 * 도서 검색 Port — 도메인이 정의하는 외부 카탈로그 검색 계약(ADR-005, design-patterns).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(NaverBookSearcher).
 */
export interface BookSearcher {
  /** 질의어로 도서를 검색한다. 결과는 관련도순. */
  search(query: string): Promise<BookSearchHit[]>;
}
