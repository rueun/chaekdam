'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import type { BookStatusKey } from '@/components/ui/status-badge';

// 네이버 책 API 응답과 같은 모양의 더미. 실제 연동 시 이 배열만 API 결과로 교체.
// 네이버 책 API 응답 기반 외부 검색 결과 뷰 타입. 도메인 Book 엔티티가 아니다
// (year=pubdate 파생, coverColor=표시 전용). 실제 연동 시 Infra 어댑터에서 매핑.
interface BookSearchResult {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  description: string;
  coverColor: string;
}

const MOCK_BOOKS: BookSearchResult[] = [
  {
    isbn: '9788932036779',
    title: '일곱 해의 마지막',
    author: '김연수',
    publisher: '문학과지성사',
    year: '2020',
    description: '시인 백석을 모티프로 한 김연수의 장편소설. 한 시인의 침묵과 한 사람의 기다림.',
    coverColor: 'var(--terra-600)',
  },
  {
    isbn: '9791191114836',
    title: '작별인사',
    author: '김영하',
    publisher: '복복서가',
    year: '2022',
    description: '기계와 인간의 경계가 흐릿해진 가까운 미래, 한 소년의 마지막 인사.',
    coverColor: 'var(--sage-700)',
  },
  {
    isbn: '9788954647014',
    title: '바깥은 여름',
    author: '김애란',
    publisher: '문학동네',
    year: '2017',
    description: '상실과 회복, 그리고 그 사이에 머무는 풍경들.',
    coverColor: 'var(--talk-500)',
  },
  {
    isbn: '9788954641340',
    title: '쇼코의 미소',
    author: '최은영',
    publisher: '문학동네',
    year: '2016',
    description: '평범한 인물들이 서로에게 닿고 떠나는 짧은 이야기들.',
    coverColor: 'var(--clay-500)',
  },
  {
    isbn: '9788954656016',
    title: '여행의 이유',
    author: '김영하',
    publisher: '문학동네',
    year: '2019',
    description: '여행하지 못하는 시기에 더 자주 펼쳐 보는 여행 에세이.',
    coverColor: 'var(--clay-700)',
  },
];

// 새로 담을 때의 책장 선택. PAUSED(쉬는 중)는 초기 등록 경로에서 제외(읽다가 쉬는 상태라 진입 후 전이).
const SHELF_OPTIONS: { value: BookStatusKey; label: string }[] = [
  { value: 'reading', label: '읽는 중' },
  { value: 'wish', label: '읽고 싶은' },
  { value: 'done', label: '완독' },
];
// 빠른 검색 칩 (ISBN 예시 포함)
const SUGGESTED_QUERIES = ['김연수', '에세이', '9788932036779'];

type SearchState = 'idle' | 'loading' | 'results' | 'empty';

/** 제목에서 검색어와 일치하는 부분(대소문자 무시)을 <mark> 로 강조한다. */
function highlightMatch(title: string, query: string): ReactNode {
  const needle = query.trim();
  if (!needle) return title;
  const lower = title.toLowerCase();
  const target = needle.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0;
  let idx = lower.indexOf(target, from);
  if (idx < 0) return title;
  while (idx >= 0) {
    if (idx > from) parts.push(title.slice(from, idx));
    parts.push(
      <mark key={idx} className="bg-mark-100 rounded-[2px] px-0.5 text-inherit">
        {title.slice(idx, idx + target.length)}
      </mark>,
    );
    from = idx + target.length;
    idx = lower.indexOf(target, from);
  }
  if (from < title.length) parts.push(title.slice(from));
  return parts;
}

export function BookSearch() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<BookSearchResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [shelf, setShelf] = useState<Record<string, BookStatusKey>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});

  // 더미 디바운스 검색 — 실제 연동 시 백엔드 프록시 호출로 교체
  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setState('idle');
      return;
    }
    setState('loading');
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      const hits = MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(needle) ||
          b.author.toLowerCase().includes(needle) ||
          b.publisher.toLowerCase().includes(needle) ||
          b.isbn.includes(needle),
      );
      setItems(hits);
      setState(hits.length > 0 ? 'results' : 'empty');
    }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-3xl">
      {/* 검색 바 */}
      <div className="mb-1 flex items-center gap-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="책 제목 · 작가 · ISBN으로 검색"
          aria-label="책 검색"
          containerClassName="flex-1"
        />
        <span className="text-caption text-fg-3 flex shrink-0 items-center gap-1.5">
          <Icon name="info" size={14} />
          전체 도서 검색
        </span>
      </div>

      {/* 결과 영역 */}
      <div aria-live="polite" aria-busy={state === 'loading'} className="mt-5">
        {state === 'idle' ? (
          <EmptyState
            icon="book-open"
            title="담고 싶은 책을 찾아주세요"
            sub="최근에 읽고 싶었던 책이나 친구가 권한 책의 제목을 적어보세요"
          >
            <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
              {SUGGESTED_QUERIES.map((rec) => (
                <Chip key={rec} size="sm" onClick={() => setQuery(rec)}>
                  {rec}
                </Chip>
              ))}
            </div>
          </EmptyState>
        ) : null}

        {state === 'loading' ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <span
              className="border-surface-2 border-t-leaf-500 size-7 animate-spin rounded-full border-[2.5px]"
              aria-hidden
            />
            <div className="text-ink-900 font-serif text-[17px] font-semibold tracking-[-0.02em]">
              책을 찾고 있어요…
            </div>
          </div>
        ) : null}

        {state === 'empty' ? (
          <EmptyState
            icon="search-x"
            title={`"${query}"에 대한 결과가 없어요`}
            sub="제목의 일부나 작가 이름으로 다시 검색해 보세요"
          />
        ) : null}

        {state === 'results' ? (
          <>
            <div className="text-body-sm text-fg-2 mb-1">
              검색 결과 <b className="text-ink-900 font-serif font-bold">{items.length}</b>권
            </div>
            <ul className="m-0 list-none p-0">
              {items.map((book) => (
                <ResultRow
                  key={book.isbn}
                  book={book}
                  query={query}
                  shelf={shelf[book.isbn] ?? 'wish'}
                  added={Boolean(added[book.isbn])}
                  onShelfChange={(v) => setShelf((p) => ({ ...p, [book.isbn]: v }))}
                  onAdd={() => setAdded((p) => ({ ...p, [book.isbn]: true }))}
                />
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {/* 안내 */}
      <p className="text-fg-3 mt-3 flex items-center gap-1.5 text-[12px]">
        <Icon name="info" size={14} />
        국내 출간 도서를 검색해요.
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
  children,
}: {
  icon: 'book-open' | 'search-x';
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <Icon name={icon} size={28} className="text-ink-500" aria-hidden />
      <div className="text-ink-900 mt-1.5 font-serif text-[17px] font-semibold tracking-[-0.02em]">
        {title}
      </div>
      <p className="text-caption text-fg-2 max-w-[360px] leading-[1.6]">{sub}</p>
      {children}
    </div>
  );
}

function ResultRow({
  book,
  query,
  shelf,
  added,
  onShelfChange,
  onAdd,
}: {
  book: BookSearchResult;
  query: string;
  shelf: BookStatusKey;
  added: boolean;
  onShelfChange: (value: BookStatusKey) => void;
  onAdd: () => void;
}) {
  return (
    <li
      className={cn(
        'border-divider grid grid-cols-[64px_1fr_auto] items-start gap-[18px] border-t p-[18px]',
        added ? 'bg-[var(--sage-100)]' : 'bg-bg-elevated',
      )}
    >
      {/* 표지 */}
      <div
        className="text-paper-50 flex aspect-[2/3] w-16 items-end rounded-[4px] px-1.5 py-2 font-serif text-[11px] leading-[1.15] font-semibold tracking-[-0.02em] shadow-[var(--shadow-cover)]"
        style={{ background: book.coverColor }}
      >
        {book.title.slice(0, 4)}
      </div>

      {/* 정보 */}
      <div className="min-w-0">
        <div className="text-ink-900 mb-1 font-serif text-[17px] leading-[1.3] font-semibold tracking-[-0.02em]">
          {highlightMatch(book.title, query)}
        </div>
        <div className="text-fg-2 mb-1.5 flex flex-wrap gap-1 text-[12px]">
          <b className="text-ink-800 font-semibold">{book.author}</b>
          <span>· {book.publisher}</span>
          <span>· {book.year}</span>
        </div>
        <p className="text-caption text-ink-700 mb-1.5 line-clamp-2 leading-[1.55]">
          {book.description}
        </p>
        <div className="text-fg-3 font-mono text-[10px]">ISBN {book.isbn}</div>
      </div>

      {/* 액션 */}
      <div className="flex min-w-[140px] flex-col items-stretch gap-2">
        {added ? (
          <div className="text-sage-700 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold">
            <Icon name="check" size={16} />
            서재에 담겼어요
          </div>
        ) : (
          <>
            <Select
              aria-label={`${book.title} 책장 선택`}
              value={shelf}
              onChange={(v) => onShelfChange(v as BookStatusKey)}
              options={SHELF_OPTIONS}
              className="w-full"
            />
            <Button variant="primary" onClick={onAdd} className="w-full">
              <Icon name="plus" size={16} />
              담기
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
