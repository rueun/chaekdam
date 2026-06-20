'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookCover } from '@/components/ui/book-cover';
import { Select } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { SessionTimer } from '@/components/feature/reader/session-timer';
import { openSessionLog } from '@/components/feature/reader/session-log-modal';
import { ROUTES } from '@/lib/router/routes';

/** 타이머 대상 — '읽는 중' 책(plain 뷰). */
export interface ReadingBookView {
  id: string;
  title: string;
  author: string;
  coverColor?: string;
  coverImageUrl?: string;
}

/**
 * 독서 세션 패널 — '읽는 중' 책을 골라 타이머로 읽은 시간을 기록한다(ADR-012).
 * 타이머 로직은 SessionTimer, 기록은 종료 시 모달 → logReadingSession 으로 위임.
 */
export function ReadingSessionPanel({ books }: { books: ReadingBookView[] }) {
  const router = useRouter();
  const [bookId, setBookId] = useState(books[0]?.id ?? '');
  const active = books.find((b) => b.id === bookId) ?? books[0];

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <span
          className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
          aria-hidden
        >
          <Icon name="book-open" size={28} />
        </span>
        <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
          읽는 중인 책이 없어요
        </div>
        <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
          서재에서 책을 &lsquo;읽는 중&rsquo;으로 바꾸면 여기서 읽은 시간을 기록할 수 있어요.
        </p>
        <Link href={ROUTES.LIBRARY()} className="btn btn-primary mt-2">
          <Icon name="library" size={16} />
          서재로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="border-divider bg-bg-elevated rounded-lg border p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <BookCover
            title={active.title}
            coverColor={active.coverColor}
            coverImageUrl={active.coverImageUrl}
            sizes="48px"
            className="shadow-2 aspect-[2/3] w-10 shrink-0 rounded-[4px]"
          />
          <div className="min-w-0">
            <div className="text-ink-900 truncate font-serif text-[20px] font-bold tracking-[-0.03em]">
              {active.title}
            </div>
            <div className="text-fg-2 truncate text-[12.5px]">{active.author}</div>
          </div>
        </div>
        {/* key=책 id — 책 전환 시 타이머를 새로 시작(진행 중 기록이 섞이지 않게) */}
        <SessionTimer
          key={active.id}
          onStop={(seconds) => openSessionLog(active.id, seconds, () => router.refresh())}
        />
      </div>

      {books.length > 1 ? (
        <div className="mt-4">
          <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">읽을 책 바꾸기</span>
          <Select
            aria-label="읽을 책 선택"
            value={bookId}
            onChange={setBookId}
            options={books.map((b) => ({ value: b.id, label: `${b.title} · ${b.author}` }))}
            className="w-full max-w-[360px]"
          />
        </div>
      ) : null}
    </div>
  );
}
