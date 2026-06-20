import Link from 'next/link';
import { StatusBadge, type BookStatusKey } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { BookCover } from '@/components/ui/book-cover';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/lib/router/routes';

/** 완독한 책 표시용 plain 뷰(Server→Client 경계 안전). */
export interface StatsCompletedBook {
  id: string;
  title: string;
  author: string;
  coverColor?: string;
  coverImageUrl?: string;
}

interface StatsBreakdownProps {
  /** 상태별 권수 */
  statusCounts: Record<BookStatusKey, number>;
  /** 완독한 책(최근 담은 순) */
  completed: StatsCompletedBook[];
}

/** 분포 표시 순서 */
const STATUS_ORDER: readonly BookStatusKey[] = ['reading', 'done', 'wish', 'paused'];

/** 스크린리더용 한국어 라벨(StatusBadge 라벨과 일치). */
const STATUS_LABEL: Record<BookStatusKey, string> = {
  reading: '읽는 중',
  done: '완독',
  wish: '읽고 싶은',
  paused: '쉬는 중',
};

/**
 * 통계 보조 섹션 — 책장 상태 분포 + 완독한 책.
 * 기존 데이터(Book)만 사용하는 순수 표현 컴포넌트(ADR-006: feature 슬라이스).
 * 색 정체성은 StatusBadge, 비율은 Progress 가 담당해 디자인 토큰만 쓴다.
 */
export function StatsBreakdown({ statusCounts, completed }: StatsBreakdownProps) {
  const total = STATUS_ORDER.reduce((sum, key) => sum + statusCounts[key], 0);

  return (
    <section className="mt-9 grid gap-6 lg:grid-cols-2">
      {/* 책장 분포 */}
      <div>
        <h2 className="text-ink-900 mb-4 font-serif text-[18px] font-semibold tracking-[-0.02em]">
          책장 분포
        </h2>
        {total === 0 ? (
          <p className="text-body-sm text-fg-2">아직 책장에 담은 책이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {STATUS_ORDER.map((key) => {
              const count = statusCounts[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="inline-flex w-[72px] shrink-0">
                    <StatusBadge status={key} size="sm" />
                  </span>
                  <Progress
                    value={(count / total) * 100}
                    className="flex-1"
                    label={`${STATUS_LABEL[key]} 비율`}
                  />
                  <span className="text-fg-2 text-body-sm w-[40px] text-right tabular-nums">
                    {count}권
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 완독한 책 */}
      <div>
        <h2 className="text-ink-900 mb-4 font-serif text-[18px] font-semibold tracking-[-0.02em]">
          완독한 책{completed.length > 0 ? ` · ${completed.length}권` : ''}
        </h2>
        {completed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span
              className="bg-surface text-fg-3 grid size-12 place-content-center rounded-full"
              aria-hidden
            >
              <Icon name="check" size={22} />
            </span>
            <p className="text-body-sm text-fg-2 leading-[1.6]">
              아직 완독한 책이 없어요.
              <br />첫 완독을 향해 한 장씩 넘겨보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {completed.map((book) => (
              <Link
                key={book.id}
                href={ROUTES.BOOKS.DETAIL(book.id)}
                className="group"
                aria-label={`${book.title} 상세 보기`}
              >
                <BookCover
                  title={book.title}
                  coverColor={book.coverColor}
                  coverImageUrl={book.coverImageUrl}
                  sizes="120px"
                  className="shadow-2 aspect-[3/4] w-full rounded-md transition-transform group-hover:-translate-y-0.5"
                />
                <div className="text-ink-800 mt-1.5 line-clamp-2 text-[12px] leading-[1.4]">
                  {book.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
