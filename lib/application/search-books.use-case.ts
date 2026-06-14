import type { BookSearcher, BookSearchHit } from '@/lib/domain/ports/book-searcher';

/**
 * 도서 검색 유스케이스(Query). 질의어를 다듬고 외부 검색 Port 에 위임한다.
 * 빈 질의어는 호출하지 않고 빈 결과를 돌려준다(불필요한 외부 호출 방지).
 */
export class SearchBooksUseCase {
  constructor(private readonly searcher: BookSearcher) {}

  execute(query: string): Promise<BookSearchHit[]> {
    const trimmed = query.trim();
    if (!trimmed) return Promise.resolve([]);
    return this.searcher.search(trimmed);
  }
}
