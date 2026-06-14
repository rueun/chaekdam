import type { BookSearcher, BookSearchHit } from '@/lib/domain/ports/book-searcher';

/**
 * 테스트용 Fake BookSearcher — 외부 API 대신 보유한 카탈로그를 질의어로 필터한다(Mock 아님).
 * 마지막 질의어를 보관해 호출 검증에 쓴다.
 */
export class FakeBookSearcher implements BookSearcher {
  lastQuery: string | null = null;

  constructor(private readonly catalog: BookSearchHit[] = []) {}

  search(query: string): Promise<BookSearchHit[]> {
    this.lastQuery = query;
    const needle = query.toLowerCase();
    return Promise.resolve(
      this.catalog.filter(
        (b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle),
      ),
    );
  }
}
