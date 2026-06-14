import { describe, it, expect } from 'vitest';
import { SearchBooksUseCase } from './search-books.use-case';
import { FakeBookSearcher } from './test-support/fake-book-searcher';
import type { BookSearchHit } from '@/lib/domain/ports/book-searcher';

const hit = (title: string, author: string): BookSearchHit => ({
  isbn: `isbn-${title}`,
  title,
  author,
  publisher: '출판사',
  publishedYear: '2020',
  description: '소개',
  imageUrl: '',
});

describe('SearchBooksUseCase', () => {
  it('질의어로 검색 결과를 반환한다', async () => {
    const searcher = new FakeBookSearcher([hit('데미안', '헤르만 헤세'), hit('수레바퀴', '헤세')]);
    const results = await new SearchBooksUseCase(searcher).execute('데미안');
    expect(results).toHaveLength(1);
    expect(results[0]!.title).toBe('데미안');
  });

  it('빈 질의어는 외부 호출 없이 빈 결과', async () => {
    const searcher = new FakeBookSearcher([hit('데미안', '헤르만 헤세')]);
    const results = await new SearchBooksUseCase(searcher).execute('   ');
    expect(results).toEqual([]);
    expect(searcher.lastQuery).toBeNull(); // 호출되지 않음
  });

  it('질의어의 앞뒤 공백을 다듬어 전달한다', async () => {
    const searcher = new FakeBookSearcher([]);
    await new SearchBooksUseCase(searcher).execute('  헤세  ');
    expect(searcher.lastQuery).toBe('헤세');
  });
});
