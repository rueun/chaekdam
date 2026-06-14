'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ReadingLogView } from './reading-log-view';

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

interface ReadingLogPanelProps {
  /** 도메인 ReadingLog 에서 매핑한 직렬화 뷰(toReadingLogView). */
  view: ReadingLogView;
  /** 담은 한 줄 수(Highlight 도메인 — 페이지에서 합성, ADR-006). */
  highlightCount: number;
  /** 완독한 책 권수(Book 도메인 — 페이지에서 합성). */
  completedBookCount: number;
}

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
 * 실제 데이터는 `view`(toReadingLogView)로 주입받는다. 월 이동만 클라이언트 상태.
 */
export function ReadingLogPanel({
  view,
  highlightCount,
  completedBookCount,
}: ReadingLogPanelProps) {
  const { today, months } = view;
  // 기본 선택 = 오늘이 속한 월(매퍼가 현재 월을 항상 포함하므로 존재).
  const todayIndex = Math.max(
    0,
    months.findIndex((m) => m.year === today.year && m.month === today.month),
  );
  const [index, setIndex] = useState(todayIndex);

  // view(months) 가 바뀌어 index 가 범위를 벗어나도 안전하도록 읽을 때 클램프한다.
  const safeIndex = Math.min(index, months.length - 1);
  const cur = months[safeIndex];
  if (!cur) return null; // months 는 최소 1개(현재 월 보장)지만 타입 안전을 위한 방어

  const readDays = new Set(cur.readDays);
  // cur.month 는 1-indexed. new Date(y, m, 0) = m월 말일, new Date(y, m-1, 1) = m월 1일.
  const daysInMonth = new Date(cur.year, cur.month, 0).getDate();
  const firstDow = new Date(cur.year, cur.month - 1, 1).getDay();
  const isCurrentMonth = cur.year === today.year && cur.month === today.month;

  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < months.length - 1;
  const goPrev = () => hasPrev && setIndex(safeIndex - 1);
  const goNext = () => hasNext && setIndex(safeIndex + 1);

  const readCount = cur.readDays.length;
  const totalHours = Math.floor(view.totalMinutes / 60);
  const totalRemMin = view.totalMinutes % 60;
  const monthLabel = `${cur.year}년 ${KO_MONTHS[cur.month - 1]}`;

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
            const isToday = isCurrentMonth && day === today.day;
            const isFuture = isCurrentMonth && day > today.day;
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
          <Stat value={String(view.currentStreak)} unit="일" label="현재 연속" />
          <Stat value={String(totalHours)} unit={`시간 ${totalRemMin}분`} label="총 독서 시간" />
          <Stat value={String(highlightCount)} unit="개" label="담은 한 줄" />
          <Stat value={String(completedBookCount)} unit="권" label="완독한 책" />
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
