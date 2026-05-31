'use client';

import { cn } from '@/lib/utils/cn';
import { StatusBadge, type BookStatusKey } from '@/components/ui/status-badge';

/**
 * BookCard 표시용 뷰모델.
 *
 * 도메인 엔티티(`Book`/`BookStatus`)가 아니라 표현 계층 전용 형태다.
 * 상태별로 다른 사용자 입력값을 보조 메타로 노출한다(아래 `bookMetaLine`).
 */
export interface BookCardView {
  /** 책 식별자 — 목록 key·상세 이동에 사용 (도메인 Book.id 매핑) */
  id: string;
  title: string;
  author: string;
  status: BookStatusKey;
  /** 표지(책등) 배경색 — CSS color. 미지정 시 잉크 톤 기본값 */
  coverColor?: string;
  /** done — 평점(★) */
  rating?: number;
  /** done — 완독일 */
  finishedAt?: string;
  /** wish/paused — 담은/시작한 날짜 */
  startedAt?: string;
  /** reading — 현재 책갈피 페이지 */
  bookmark?: number;
  /** reading — 마지막 활동(캡처/AI 대화/책갈피 갱신) */
  lastActive?: string;
}

/**
 * 상태 배지 옆에 붙는 보조 메타 한 줄.
 *
 * 종이책 리더의 체류 '분'은 신뢰 있게 측정할 수 없으므로 '오늘 28분 읽음'
 * 류는 노출하지 않는다. 대신 책갈피·마지막 활동·완독일 등을 보여준다.
 */
export function bookMetaLine(b: BookCardView): string {
  if (b.status === 'done') {
    const stars = b.rating ? `★ ${b.rating.toFixed(1)}` : '';
    return [stars, b.finishedAt ? `${b.finishedAt} 완독` : null].filter(Boolean).join(' · ');
  }
  if (b.status === 'wish') return b.startedAt ? `${b.startedAt} 담음` : '읽고 싶은 책';
  if (b.status === 'paused') return ['쉬는 중', b.startedAt].filter(Boolean).join(' · ');
  // reading
  const bm = b.bookmark ? `현재 p.${b.bookmark}` : null;
  return [bm, b.lastActive].filter(Boolean).join(' · ') || (b.startedAt ?? '');
}

interface BookCardProps {
  book: BookCardView;
  /** 지정 시 카드가 클릭/키보드로 열림 (Enter·Space) */
  onOpen?: () => void;
  className?: string;
}

/**
 * 책장 카드 — 표지 + 제목/저자 + 상태 배지 + 보조 메타.
 *
 * 표지는 hover 시 살짝 떠오른다(`group-hover`). 레이아웃·타이포·색은 모두
 * 디자인 토큰(`var(--*)`)을 참조한다(raw hex 미사용).
 */
export function BookCard({ book, onOpen, className }: BookCardProps) {
  const content = (
    <>
      {/* 표지 — 책등 효과 그림자, hover 시 부상 */}
      <div
        className={cn(
          'flex aspect-[2/3] items-end rounded-[6px] px-[14px] py-4',
          'text-[16px] leading-[1.25] font-semibold tracking-[-0.03em]',
          'text-paper-50 shadow-[var(--shadow-cover)]', // shadow-cover 는 @theme 외 커스텀
          'transition-all duration-[240ms] ease-[var(--ease-out)]',
          'group-hover:shadow-3 group-hover:-translate-y-0.5',
        )}
        style={{ background: book.coverColor ?? 'var(--ink-700)' }}
      >
        {book.title}
      </div>

      {/* 메타 — 제목 / 저자 / 상태 행 */}
      <div>
        <div className="text-ink-900 line-clamp-1 text-[15px] font-semibold tracking-[-0.02em]">
          {book.title}
        </div>
        <div className="text-fg-2 mt-[3px] text-[12px]">{book.author}</div>

        <div className="mt-2 flex min-w-0 items-center gap-2">
          <StatusBadge status={book.status} size="sm" className="shrink-0" />
          <span className="text-fg-3 min-w-0 truncate font-mono text-[11px] tracking-[-0.01em]">
            {bookMetaLine(book)}
          </span>
        </div>
      </div>
    </>
  );

  const baseClass = cn(
    'group flex flex-col gap-3 transition-transform duration-200 ease-[var(--ease-out)]',
    className,
  );

  // 클릭 가능하면 네이티브 <button> — 포커스·Enter/Space 키보드 동작이 기본 제공된다.
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          baseClass,
          'w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left',
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
