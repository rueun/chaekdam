import type { BookSearchHit } from '@/lib/domain/ports/book-searcher';

// 네이버 책 검색 응답 → 도메인 BookSearchHit 매핑(순수 함수, 네트워크/ server-only 없음 — 테스트 용이).
// 응답 필드의 title/author/publisher/description 에는 <b> 태그·HTML 엔티티가 섞여 들어온다.

/** 네이버 책 검색 응답 item(필요 필드만). */
export interface NaverBookItem {
  title: string;
  image: string;
  author: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}

export interface NaverBookResponse {
  items?: NaverBookItem[];
}

/** <b> 등 태그 제거 + HTML 엔티티 디코드(명명 + 숫자 참조) + 트림. */
function clean(raw: string): string {
  return (
    raw
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
      // &amp; 는 다른 엔티티 복원 후 마지막에 처리(이중 디코드 방지).
      .replace(/&amp;/g, '&')
      .trim()
  );
}

/** "8937460777 9788937460775" 같은 문자열에서 13자리 ISBN 우선 선택. */
function pickIsbn(raw: string): string {
  const tokens = raw.split(/\s+/).filter(Boolean);
  return tokens.find((t) => t.length === 13) ?? tokens[0] ?? '';
}

/** "20200115" → "2020". 형식이 아니면 빈 문자열. */
function toYear(pubdate: string): string {
  return /^\d{4}/.test(pubdate) ? pubdate.slice(0, 4) : '';
}

export function toBookSearchHit(item: NaverBookItem): BookSearchHit {
  return {
    isbn: pickIsbn(item.isbn ?? ''),
    title: clean(item.title ?? ''),
    // 다중 저자는 '^' 로 구분되어 온다 → 쉼표로.
    author: clean((item.author ?? '').replace(/\s*\^\s*/g, ', ')),
    publisher: clean(item.publisher ?? ''),
    publishedYear: toYear(item.pubdate ?? ''),
    description: clean(item.description ?? ''),
    imageUrl: item.image ?? '',
  };
}

export function toBookSearchHits(response: NaverBookResponse): BookSearchHit[] {
  return (response.items ?? []).map(toBookSearchHit);
}
