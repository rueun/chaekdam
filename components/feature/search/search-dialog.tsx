'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/lib/router/routes';

// 전체 검색 샘플 데이터 — 추후 통합 검색 유스케이스로 대체.
interface SearchBook {
  id: string;
  title: string;
  author: string;
  meta: string;
  coverColor: string;
}
interface SearchQuote {
  id: string;
  text: string;
  author: string;
  book: string;
  page: string;
}
interface SearchAuthor {
  id: string;
  name: string;
  meta: string;
}

const BOOKS: SearchBook[] = [
  {
    id: 'b1',
    title: '일곱 해의 마지막',
    author: '김연수',
    meta: '소설 · 읽는 중',
    coverColor: 'var(--terra-600)',
  },
  {
    id: 'b3',
    title: '바깥은 여름',
    author: '김애란',
    meta: '소설 · 완독',
    coverColor: 'var(--talk-500)',
  },
  {
    id: 'b6',
    title: '여행의 이유',
    author: '김영하',
    meta: '산문 · 읽고 싶은',
    coverColor: 'var(--sage-700)',
  },
];
const QUOTES: SearchQuote[] = [
  {
    id: 'q1',
    text: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
    author: '김연수',
    book: '일곱 해의 마지막',
    page: 'p.42',
  },
  {
    id: 'q2',
    text: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다.',
    author: '김애란',
    book: '바깥은 여름',
    page: 'p.94',
  },
];
const AUTHORS: SearchAuthor[] = [
  { id: 'a1', name: '김연수', meta: '소설가 · 담은 한 줄 14개' },
  { id: 'a2', name: '김애란', meta: '소설가 · 담은 한 줄 8개' },
];
const RECENT = ['데미안', '김연수', '여름'];

type Scope = 'all' | 'books' | 'quotes' | 'authors';
const SCOPES: { key: Scope; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'books', label: '책' },
  { key: 'quotes', label: '한 줄' },
  { key: 'authors', label: '작가' },
];

/** 텍스트에서 검색어 일치 부분을 <mark> 로 감싼다(대소문자 무시, 모든 일치). */
function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part,
  );
}

/** 책담 전체 검색 모달을 띄운다. */
export function openSearch() {
  overlay.open(({ isOpen, unmount }) => <SearchDialog isOpen={isOpen} onClose={unmount} />);
}

function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');

  const ql = query.trim().toLowerCase();

  const books = useMemo(
    () =>
      !ql
        ? []
        : BOOKS.filter(
            (b) =>
              b.title.toLowerCase().includes(ql) ||
              b.author.toLowerCase().includes(ql) ||
              b.meta.toLowerCase().includes(ql),
          ),
    [ql],
  );
  const quotes = useMemo(
    () =>
      !ql
        ? []
        : QUOTES.filter(
            (q) =>
              q.text.toLowerCase().includes(ql) ||
              q.author.toLowerCase().includes(ql) ||
              q.book.toLowerCase().includes(ql),
          ),
    [ql],
  );
  const authors = useMemo(
    () => (!ql ? [] : AUTHORS.filter((a) => a.name.toLowerCase().includes(ql))),
    [ql],
  );

  const totalHits = books.length + quotes.length + authors.length;
  const showBooks = scope === 'all' || scope === 'books';
  const showQuotes = scope === 'all' || scope === 'quotes';
  const showAuthors = scope === 'all' || scope === 'authors';

  const goBook = (id: string) => {
    onClose();
    router.push(ROUTES.BOOKS.DETAIL(id));
  };
  const goQuotes = () => {
    onClose();
    router.push(ROUTES.HIGHLIGHTS());
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="책담 전체 검색"
      hideHeader
      className="w-[min(820px,100%)] p-0"
      initialFocusRef={inputRef}
    >
      {/* 검색 입력 */}
      <div className="border-divider flex items-center gap-2.5 border-b px-4 py-3.5">
        <Icon name="search" size={18} className="text-fg-3" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          placeholder="책, 작가, 한 줄을 검색해 보세요"
          aria-label="전체 검색"
          className="text-ink-900 placeholder:text-paper-400 flex-1 bg-transparent text-[15px] outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="지우기"
            className="text-fg-3 hover:text-ink-700 grid size-6 place-content-center rounded-md"
          >
            <Icon name="x" size={16} />
          </button>
        ) : null}
        <span className="border-divider text-fg-3 rounded border px-1.5 py-0.5 font-mono text-[11px]">
          esc
        </span>
      </div>

      {/* 스코프 */}
      <div className="border-divider flex gap-2 border-b px-4 py-3">
        {SCOPES.map((s) => (
          <Chip key={s.key} size="sm" active={scope === s.key} onClick={() => setScope(s.key)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {/* 결과 */}
      <div className="max-h-[480px] overflow-auto px-4 py-3">
        {!ql ? (
          <>
            <Section title="최근 검색">
              <div className="flex flex-wrap gap-2">
                {RECENT.map((r) => (
                  <Chip key={r} size="sm" onClick={() => setQuery(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </Section>
            <Section title="최근 본 책">
              {BOOKS.slice(0, 3).map((b) => (
                <ResultRow key={b.id} onClick={() => goBook(b.id)}>
                  <BookCover book={b} />
                  <RowBody title={b.title} sub={`${b.author} · ${b.meta}`} />
                  <Enter />
                </ResultRow>
              ))}
            </Section>
          </>
        ) : totalHits === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Icon name="search-x" size={32} className="text-ink-500" />
            <div className="text-ink-900 text-[15px] font-semibold">
              &ldquo;{query}&rdquo;에 대한 결과가 없어요
            </div>
            <div className="text-fg-2 text-[13px]">다른 키워드나 작가 이름으로 검색해 보세요.</div>
          </div>
        ) : (
          <>
            {showBooks && books.length > 0 ? (
              <Section title="책" count={books.length}>
                {books.map((b) => (
                  <ResultRow key={b.id} onClick={() => goBook(b.id)}>
                    <BookCover book={b} />
                    <RowBody
                      title={highlightMatch(b.title, query)}
                      sub={
                        <>
                          {highlightMatch(b.author, query)} · {b.meta}
                        </>
                      }
                    />
                    <Enter />
                  </ResultRow>
                ))}
              </Section>
            ) : null}

            {showQuotes && quotes.length > 0 ? (
              <Section title="한 줄" count={quotes.length}>
                {quotes.map((q) => (
                  <ResultRow key={q.id} onClick={goQuotes}>
                    <span className="bg-surface text-fg-2 grid size-9 shrink-0 place-content-center rounded-[8px]">
                      <Icon name="quote" size={16} />
                    </span>
                    <RowBody
                      title={
                        <span className="font-serif italic">
                          &ldquo;{highlightMatch(q.text, query)}&rdquo;
                        </span>
                      }
                      sub={`${q.author} · ${q.book} · ${q.page}`}
                    />
                    <Enter />
                  </ResultRow>
                ))}
              </Section>
            ) : null}

            {showAuthors && authors.length > 0 ? (
              <Section title="작가" count={authors.length}>
                {authors.map((a) => (
                  <ResultRow key={a.id}>
                    <span className="bg-surface text-fg-2 grid size-9 shrink-0 place-content-center rounded-[8px]">
                      <Icon name="user-round" size={16} />
                    </span>
                    <RowBody title={highlightMatch(a.name, query)} sub={a.meta} />
                  </ResultRow>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </div>

      {/* 푸터 힌트 */}
      <div className="border-divider text-fg-3 flex items-center justify-between border-t px-4 py-2.5 text-[11px]">
        <div className="flex gap-3.5">
          <Hint keys="↵">열기</Hint>
          <Hint keys="esc">닫기</Hint>
        </div>
        <span>책담 전체 검색</span>
      </div>
    </ModalShell>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-fg-3 mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold tracking-[0.08em] uppercase">
        {title}
        {count != null ? <span className="text-fg-3 font-mono">{count}</span> : null}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  // 이동 대상이 없는 행(예: 작가 — 상세 라우트 없음)은 버튼이 아닌 일반 행으로
  if (!onClick) {
    return (
      <div className="flex w-full items-center gap-3.5 rounded-[10px] px-2.5 py-2.5 text-left">
        {children}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-paper-100 flex w-full items-center gap-3.5 rounded-[10px] px-2.5 py-2.5 text-left"
    >
      {children}
    </button>
  );
}

function BookCover({ book }: { book: SearchBook }) {
  return (
    <span
      className="grid aspect-[2/3] w-9 shrink-0 place-items-center rounded-[3px] font-serif text-[9px] font-semibold text-[#FDFBF7] shadow-[var(--shadow-spine)]"
      style={{ background: book.coverColor }}
      aria-hidden
    >
      {book.title.slice(0, 3)}
    </span>
  );
}

function RowBody({ title, sub }: { title: ReactNode; sub: ReactNode }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="text-ink-900 block truncate text-[14px] font-semibold [&_mark]:bg-[var(--mark-100)] [&_mark]:px-0.5">
        {title}
      </span>
      <span className="text-fg-2 mt-0.5 block truncate text-[12px] [&_mark]:bg-[var(--mark-100)] [&_mark]:px-0.5">
        {sub}
      </span>
    </span>
  );
}

function Enter() {
  return <span className="text-fg-3 ml-auto font-mono text-[12px]">↵</span>;
}

function Hint({ keys, children }: { keys: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="border-divider rounded border px-1.5 py-0.5 font-mono text-[11px]">
        {keys}
      </span>
      {children}
    </span>
  );
}
