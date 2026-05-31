'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

// 결정적 렌더(하이드레이션 안전)를 위해 '오늘'과 로그를 고정 샘플로 둔다.
// 통계 파생값(분/한 줄 수)도 임시이며, 추후 ReadingLog 조회 유스케이스로 대체한다.
const TODAY = { y: 2026, m: 5, d: 31 };
const KO_MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];
const DOWS = ['일', '월', '화', '수', '목', '금', '토'];
const keyOf = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;
const READING_LOG: Record<string, number[]> = {
  '2026-05': [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 29, 31],
  '2026-04': [2, 3, 5, 7, 9, 10, 12, 14, 17, 19, 21, 24, 26, 28],
};

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-ink-700 hover:bg-surface disabled:text-paper-400 grid size-[30px] cursor-pointer place-content-center rounded-md text-[18px] leading-none transition-colors duration-[120ms] disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div>
      <div className="text-ink-900 font-serif text-[22px] leading-[1.1] font-semibold tracking-[-0.02em]">
        {value}
        <small className="text-caption text-fg-2 ml-0.5 font-medium">{unit}</small>
      </div>
      <div className="text-fg-3 mt-1 text-[12px] tracking-[-0.01em]">{label}</div>
    </div>
  );
}

/**
 * 월간 독서 기록 패널 — 독서일 히트맵 캘린더 + 요약 통계.
 * (도메인 엔티티 `ReadingLog` 와 이름을 구분하기 위해 Panel 접미사.)
 * 새 스타일 컨벤션대로 Tailwind 유틸 + @theme 토큰으로 작성.
 */
export function ReadingLogPanel() {
  const [cur, setCur] = useState({ y: TODAY.y, m: TODAY.m });

  const readDays = new Set(READING_LOG[keyOf(cur.y, cur.m)] ?? []);
  // cur.m 은 1-indexed. new Date(y, m, 0) = m월의 말일, new Date(y, m-1, 1) = m월 1일.
  const daysInMonth = new Date(cur.y, cur.m, 0).getDate();
  const firstDow = new Date(cur.y, cur.m - 1, 1).getDay();
  const isCurrentMonth = cur.y === TODAY.y && cur.m === TODAY.m;

  const hasPrev = (cur.m === 1 ? keyOf(cur.y - 1, 12) : keyOf(cur.y, cur.m - 1)) in READING_LOG;
  const hasNext = (cur.m === 12 ? keyOf(cur.y + 1, 1) : keyOf(cur.y, cur.m + 1)) in READING_LOG;
  const goPrev = () =>
    hasPrev && setCur((p) => (p.m === 1 ? { y: p.y - 1, m: 12 } : { y: p.y, m: p.m - 1 }));
  const goNext = () =>
    hasNext && setCur((p) => (p.m === 12 ? { y: p.y + 1, m: 1 } : { y: p.y, m: p.m + 1 }));

  const readCount = readDays.size;
  const minutes = readCount * 24;
  const highlightCount = Math.round(readCount * 0.7);
  const monthLabel = `${cur.y}년 ${KO_MONTHS[cur.m - 1]}`;

  return (
    <section
      aria-label="독서 기록"
      className="border-divider bg-bg-elevated mb-9 grid grid-cols-[420px_1fr] items-start gap-11 rounded-lg border px-8 py-7 max-[1100px]:grid-cols-1"
    >
      {/* 캘린더 */}
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-fg-3 mb-1 text-[11px] font-bold tracking-[0.1em] uppercase">
              독서 기록
            </div>
            <div className="text-ink-900 px-2 font-serif text-[26px] font-semibold tracking-[-0.03em] whitespace-nowrap">
              {monthLabel}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NavButton onClick={goPrev} disabled={!hasPrev} label="이전 달">
              ‹
            </NavButton>
            <NavButton onClick={goNext} disabled={!hasNext} label="다음 달">
              ›
            </NavButton>
          </div>
        </div>

        <div role="row" className="mb-1.5 grid grid-cols-7 gap-1.5">
          {DOWS.map((d, i) => (
            <span
              key={d}
              role="columnheader"
              className={cn(
                'text-fg-3 py-1 text-center text-[11px] font-semibold tracking-[0.04em]',
                i === 0 && 'text-leaf-600',
              )}
            >
              {d}
            </span>
          ))}
        </div>

        <div
          role="grid"
          aria-label={`${monthLabel} 독서 캘린더`}
          className="grid grid-cols-7 gap-1.5"
        >
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" aria-hidden />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dow = (firstDow + i) % 7;
            const isRead = readDays.has(day);
            const isToday = isCurrentMonth && day === TODAY.d;
            const isFuture = isCurrentMonth && day > TODAY.d;
            return (
              <div
                key={day}
                role="gridcell"
                aria-current={isToday ? 'date' : undefined}
                aria-label={`${day}일${isToday ? ', 오늘' : ''}${isRead ? ', 읽음' : ''}`}
                className={cn(
                  'bg-surface text-ink-700 grid aspect-square place-content-center rounded-md text-[13px] font-semibold tracking-[-0.01em] transition-transform duration-[120ms]',
                  dow === 0 && 'text-leaf-600',
                  isFuture && 'text-paper-400 font-medium',
                  isRead && 'bg-leaf-500 text-white hover:scale-105',
                  isToday && 'ring-clay-500 ring-[2.5px] ring-inset',
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="flex flex-col gap-[18px]">
        <div className="border-divider border-b pb-4">
          <div>
            <span className="text-ink-900 font-serif text-[80px] leading-[0.95] font-medium tracking-[-0.05em]">
              {readCount}
            </span>
            <span className="text-ink-700 ml-1 font-serif text-[24px] font-medium">일</span>
          </div>
          <div className="text-caption text-fg-2 mt-1.5">
            {isCurrentMonth ? '이번 달 읽은 날' : '읽은 날'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-[18px] gap-y-3.5">
          <Stat value="14" unit="일" label="현재 연속" />
          <Stat
            value={String(Math.floor(minutes / 60))}
            unit={`시간 ${minutes % 60}분`}
            label="총 독서 시간"
          />
          <Stat value={String(highlightCount)} unit="개" label="담은 한 줄" />
          <Stat value="3" unit="권" label="완독한 책" />
        </div>

        <div className="border-divider text-fg-3 flex items-center gap-3.5 border-t pt-3 text-[11px]">
          <span className="inline-flex items-center">
            <span
              aria-hidden
              className="bg-leaf-500 mr-1.5 inline-block size-3 rounded-[3px] align-[-2px]"
            />
            읽음
          </span>
          <span className="inline-flex items-center">
            <span
              aria-hidden
              className="bg-surface-2 mr-1.5 inline-block size-3 rounded-[3px] align-[-2px]"
            />
            미독
          </span>
          <span className="inline-flex items-center">
            <span
              aria-hidden
              className="ring-clay-500 mr-1.5 inline-block size-3 rounded-[3px] bg-white align-[-2px] ring-2 ring-inset"
            />
            오늘
          </span>
        </div>
      </div>
    </section>
  );
}
