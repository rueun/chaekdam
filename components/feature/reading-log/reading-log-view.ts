// 이 파일은 Presentation → Domain 의 'import type'(타입 전용) 의존만 가진다.
// 런타임 의존이 아니므로 번들·계층 규칙(ADR-003) 위반이 아니다.
import type { ReadingLog } from '@/lib/domain/reading-log/reading-log';

/** 한 달치 캘린더 데이터(클라이언트 전달용 plain 객체). */
export interface MonthCalendarView {
  /** 'YYYY-MM' */
  key: string;
  year: number;
  /** 1~12 */
  month: number;
  /** 읽은 날(일) 오름차순 */
  readDays: number[];
  /** 그 달 누적 분 */
  minutes: number;
}

/** ReadingLogPanel·Hero 에 넘기는 직렬화 가능한 독서 기록 뷰. */
export interface ReadingLogView {
  today: { year: number; month: number; day: number };
  /** 기록 있는 월 + (없으면 현재 월 포함), 오름차순 */
  months: MonthCalendarView[];
  currentStreak: number;
  totalMinutes: number;
  /** 오늘 읽은 분(Hero) */
  minutesToday: number;
  /** 어제 대비 증감 분(Hero) */
  deltaMinutes: number;
}

/**
 * 도메인 ReadingLog 를 클라이언트 컴포넌트로 넘길 수 있는 plain 뷰로 매핑한다.
 * (클래스 인스턴스는 Server→Client 경계를 넘지 못하므로 경계에서 평탄화.)
 */
export function toReadingLogView(log: ReadingLog): ReadingLogView {
  const today = log.todayParts;
  const recorded = log.recordedMonths();
  // 오늘 마커·기본 월 표시를 위해 현재 월은 기록이 없어도 포함한다.
  const hasCurrent = recorded.some((m) => m.year === today.year && m.month === today.month);
  const monthsRaw = hasCurrent ? recorded : [...recorded, { year: today.year, month: today.month }];
  // 현재 월을 끝에 추가했을 때 위치가 보장되지 않으므로(미래 날짜 데이터 등) 다시 정렬한다.
  monthsRaw.sort((a, b) => a.year - b.year || a.month - b.month);

  const months: MonthCalendarView[] = monthsRaw.map((m) => ({
    key: `${m.year}-${String(m.month).padStart(2, '0')}`,
    year: m.year,
    month: m.month,
    readDays: log.readDaysOf(m.year, m.month),
    minutes: log.monthMinutes(m.year, m.month),
  }));

  return {
    today,
    months,
    currentStreak: log.currentStreak,
    totalMinutes: log.totalMinutes,
    minutesToday: log.minutesToday,
    deltaMinutes: log.deltaMinutesFromYesterday,
  };
}
