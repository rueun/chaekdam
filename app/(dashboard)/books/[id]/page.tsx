import { notFound, redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import {
  BookDetail,
  type BookDetailView,
  type BookDetailRoom,
  type BookDetailSession,
} from '@/components/feature/book-detail/book-detail';
import type { HighlightView } from '@/components/feature/highlight/highlight-card';
import { toBookStatusKey } from '@/components/feature/library/book-status-map';
import { createAuthSession, createGetBookDetailUseCase } from '@/lib/infrastructure/di-container';
import type { BookDetailResult } from '@/lib/application/get-book-detail.use-case';
import { Author } from '@/lib/domain/author/author';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

const RECENT_SESSIONS_LIMIT = 6;

/** 날짜 → '6월 14일'(KST 고정). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

/** 도메인 집계 → 책 상세 뷰. 도메인 미보유 메타(출판사·장르·소개·별점 등)는 생략한다. */
function toBookDetailView(detail: BookDetailResult): BookDetailView {
  const { book, highlights, discussions, sessions } = detail;
  const author = book.author.trim() ? book.author : undefined;

  const highlightViews: HighlightView[] = highlights.map((h) => ({
    id: h.id,
    content: h.content,
    author,
    book: book.title,
    page: h.page ?? undefined,
    dateLabel: formatDateLabel(h.createdAt),
  }));

  const rooms: BookDetailRoom[] = discussions.map((d) => ({
    id: d.id,
    personaKey: d.personaKey,
    topic: d.title ?? '대화',
    when: formatDateLabel(d.createdAt),
    turns: d.messageCount,
  }));

  const recentSessions: BookDetailSession[] = [...sessions]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, RECENT_SESSIONS_LIMIT)
    .map((s) => ({
      id: s.id,
      date: formatDateLabel(s.occurredAt),
      activity: `${s.minutes}분 읽음`,
      // startPage/endPage 로 직접 좁혀(getter 가 아니라) 타입 안전하게 표기.
      range: s.startPage !== null && s.endPage !== null ? `p.${s.startPage} → p.${s.endPage}` : '—',
    }));

  return {
    id: book.id,
    title: book.title,
    author: author ?? '',
    coverColor: book.coverColor ?? 'var(--leaf-500)',
    coverImageUrl: book.coverImageUrl ?? undefined,
    status: toBookStatusKey(book.status),
    addedAt: formatDateLabel(book.createdAt),
    quotesCount: highlights.length,
    sessions: sessions.length,
    tags: [],
    // 사망 작가만 '작가 본인' 페르소나 활성(ADR-022, 큐레이션 판정).
    authorDeceased: Author.isDeceased(book.author),
    highlights: highlightViews,
    rooms,
    recentSessions,
  };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const { id } = await params;
  const detail = await (await createGetBookDetailUseCase()).execute(userId, id);
  if (!detail) notFound();

  const view = toBookDetailView(detail);

  return (
    <>
      <TopBar title={view.title} subtitle={view.author} showSearch={false} />
      <BookDetail book={view} />
    </>
  );
}
