'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { BookCover } from '@/components/ui/book-cover';
import { toast } from '@/components/ui/toast';
import type { BookStatusKey } from '@/components/ui/status-badge';
import {
  addBook,
  searchBooks,
  listOwnedBookKeys,
  type BookSearchHit,
} from '@/app/(dashboard)/library/actions';
import { ownedBookKey } from '@/lib/book-key';

// 새로 담을 때의 책장 선택. PAUSED(쉬는 중)는 초기 등록 경로에서 제외(읽다가 쉬는 상태라 진입 후 전이).
const SHELF_OPTIONS: { value: BookStatusKey; label: string }[] = [
  { value: 'reading', label: '읽는 중' },
  { value: 'wish', label: '읽고 싶은' },
  { value: 'done', label: '완독' },
];
// 빠른 검색 칩
const SUGGESTED_QUERIES = ['김연수', '에세이', '김애란'];
// 책장 미선택 시 기본값
const DEFAULT_SHELF: BookStatusKey = 'wish';
const SEARCH_DEBOUNCE_MS = 380;

// 표지는 실사 썸네일 대신 페이퍼 색 스파인으로 표시(디자인 시스템). ISBN/제목 해시로 색을 고정한다.
const COVER_PALETTE = [
  'var(--terra-600)',
  'var(--sage-700)',
  'var(--talk-500)',
  'var(--clay-500)',
  'var(--clay-700)',
  'var(--leaf-500)',
];
function coverColorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return COVER_PALETTE[hash % COVER_PALETTE.length] ?? COVER_PALETTE[0]!;
}
/** 결과 행을 구분하는 키(ISBN 우선, 없으면 제목+저자로 충돌 완화). */
const hitKey = (book: BookSearchHit): string => book.isbn || `${book.title}__${book.author}`;

type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error';

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
  const [items, setItems] = useState<BookSearchHit[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [shelf, setShelf] = useState<Record<string, BookStatusKey>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  // 이미 서재에 있는 책(제목+저자 키) — '담음' 표시용. ISBN 미저장이라 제목·저자로 매칭(ADR-016).
  const [ownedKeys, setOwnedKeys] = useState<ReadonlySet<string>>(new Set());

  const mountedRef = useRef(true);
  // 디바운스+비동기라 늦게 도착한 이전 질의 응답을 버리기 위한 요청 번호.
  const reqIdRef = useRef(0);
  useEffect(() => {
    // Strict Mode 의 마운트 재실행에서도 true 로 복구되도록 setup 에서 설정.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 보유 책 키 로드 — 검색 결과 중 이미 서재에 있는 것을 '담음'으로 표시.
  useEffect(() => {
    void (async () => {
      const keys = await listOwnedBookKeys();
      if (mountedRef.current) setOwnedKeys(new Set(keys));
    })();
  }, []);

  // 이미 서재에 있는지(이번 세션에 담은 것 + 기존 보유분).
  const isOwned = (book: BookSearchHit) =>
    Boolean(added[hitKey(book)]) || ownedKeys.has(ownedBookKey(book.title, book.author));

  // 책장에 담기 — Server Action 호출(AddBookToShelf 유스케이스). 성공 시 행을 담김 상태로.
  const handleAdd = (book: BookSearchHit) => {
    const key = hitKey(book);
    if (added[key] || adding === key) return; // 중복 담기·중복 제출 방지
    void (async () => {
      setAdding(key);
      const result = await addBook({
        title: book.title,
        author: book.author,
        status: shelf[key] ?? DEFAULT_SHELF,
        coverColor: coverColorFor(key),
        coverImageUrl: book.imageUrl || undefined, // 썸네일 있으면 저장(없으면 색 스파인)
      });
      if (!mountedRef.current) return;
      setAdding(null);
      if (result.ok) {
        setAdded((p) => ({ ...p, [key]: true }));
        setOwnedKeys((prev) => new Set(prev).add(ownedBookKey(book.title, book.author)));
        toast('서재에 담았어요');
      } else {
        toast(result.error);
      }
    })();
  };

  // 디바운스 검색 — searchBooks Server Action(NaverBookSearcher) 호출. 늦은 응답은 폐기.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setState('idle');
      return;
    }
    setState('loading');
    const reqId = (reqIdRef.current += 1);
    const timer = setTimeout(() => {
      void (async () => {
        const result = await searchBooks(q);
        if (!mountedRef.current || reqId !== reqIdRef.current) return; // 최신 질의만 반영
        if (!result.ok) {
          setItems([]);
          setState('error');
          return;
        }
        setItems(result.results);
        setState(result.results.length > 0 ? 'results' : 'empty');
      })();
    }, SEARCH_DEBOUNCE_MS);
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

        {state === 'error' ? (
          <EmptyState icon="search-x" title="검색에 실패했어요" sub="잠시 후 다시 시도해 주세요" />
        ) : null}

        {state === 'results' ? (
          <>
            <div className="text-body-sm text-fg-2 mb-1">
              검색 결과 <b className="text-ink-900 font-serif font-bold">{items.length}</b>권
            </div>
            <ul className="m-0 list-none p-0">
              {items.map((book, i) => {
                const key = hitKey(book);
                return (
                  <ResultRow
                    key={`${key}-${i}`}
                    book={book}
                    coverColor={coverColorFor(key)}
                    query={query}
                    shelf={shelf[key] ?? DEFAULT_SHELF}
                    added={isOwned(book)}
                    pending={adding === key}
                    onShelfChange={(v) => setShelf((p) => ({ ...p, [key]: v }))}
                    onAdd={() => handleAdd(book)}
                  />
                );
              })}
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
  coverColor,
  query,
  shelf,
  added,
  pending,
  onShelfChange,
  onAdd,
}: {
  book: BookSearchHit;
  coverColor: string;
  query: string;
  shelf: BookStatusKey;
  added: boolean;
  pending: boolean;
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
      {/* 표지 — 썸네일 있으면 실제 표지, 없으면 색 스파인 */}
      <BookCover
        title={book.title}
        coverColor={coverColor}
        coverImageUrl={book.imageUrl || null}
        sizes="64px"
        className="text-paper-50 flex aspect-[2/3] w-16 items-end rounded-[4px] px-1.5 py-2 font-serif text-[11px] leading-[1.15] font-semibold tracking-[-0.02em] shadow-[var(--shadow-cover)]"
        fallback={book.title.slice(0, 4)}
      />

      {/* 정보 */}
      <div className="min-w-0">
        <div className="text-ink-900 mb-1 font-serif text-[17px] leading-[1.3] font-semibold tracking-[-0.02em]">
          {highlightMatch(book.title, query)}
        </div>
        <div className="text-fg-2 mb-1.5 flex flex-wrap gap-1 text-[12px]">
          {book.author ? <b className="text-ink-800 font-semibold">{book.author}</b> : null}
          {book.publisher ? <span>· {book.publisher}</span> : null}
          {book.publishedYear ? <span>· {book.publishedYear}</span> : null}
        </div>
        {book.description ? (
          <p className="text-caption text-ink-700 mb-1.5 line-clamp-2 leading-[1.55]">
            {book.description}
          </p>
        ) : null}
        {book.isbn ? <div className="text-fg-3 font-mono text-[10px]">ISBN {book.isbn}</div> : null}
      </div>

      {/* 액션 */}
      <div className="flex min-w-[140px] flex-col items-stretch gap-2">
        {added ? (
          <div className="text-sage-700 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold">
            <Icon name="check" size={16} />
            이미 담은 책이에요
          </div>
        ) : (
          <>
            <Select
              aria-label={`${book.title} 책장 선택`}
              value={shelf}
              onChange={(v) => onShelfChange(v as BookStatusKey)}
              options={SHELF_OPTIONS}
              disabled={pending}
              className="w-full"
            />
            <Button variant="primary" onClick={onAdd} disabled={pending} className="w-full">
              <Icon name="plus" size={16} />
              {pending ? '담는 중…' : '담기'}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
