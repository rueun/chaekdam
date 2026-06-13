import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import {
  toReadingDayKey,
  readingDayKeyOf,
  previousReadingDayKey,
} from '@/lib/domain/reading-log/reading-day';

/**
 * 독서 기록 투영(projection) — 독서 세션 묶음을 일자별 통계·연속일로 집계한 읽기 전용 뷰.
 * 별도 테이블 없이 ReadingSession 에서 파생한다(ADR: 세션 단일 출처). 불변.
 *
 * "오늘"은 호출자가 주입한 시각을 KST 캘린더 날짜로 환산해 기준으로 삼는다(결정성).
 */
export class ReadingLog {
  private constructor(
    // ReadonlyMap 타입 + private + 외부로 절대 반환하지 않음(모든 게터가 내부에서 계산)으로
    // 불변성을 보장한다. Map 은 Object.freeze 로 변이를 막을 수 없으므로 캡슐화에 의존한다.
    /** KST 날짜 키('YYYY-MM-DD') → 그날 읽은 총 분 */
    private readonly minutesByDay: ReadonlyMap<string, number>,
    /** 기준이 되는 오늘의 날짜 키 */
    private readonly todayKey: string,
  ) {
    Object.freeze(this);
  }

  /** 세션 묶음과 기준 시각(오늘)으로부터 기록을 집계한다. */
  static from(sessions: readonly ReadingSession[], today: Date): ReadingLog {
    const minutesByDay = new Map<string, number>();
    for (const session of sessions) {
      const key = toReadingDayKey(session.occurredAt);
      minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.minutes);
    }
    return new ReadingLog(minutesByDay, toReadingDayKey(today));
  }

  /** 오늘 읽은 분. */
  get minutesToday(): number {
    return this.minutesByDay.get(this.todayKey) ?? 0;
  }

  /** 어제 대비 오늘 읽은 분의 증감. */
  get deltaMinutesFromYesterday(): number {
    const yesterday = this.minutesByDay.get(previousReadingDayKey(this.todayKey)) ?? 0;
    return this.minutesToday - yesterday;
  }

  /** 전체 누적 독서 분. */
  get totalMinutes(): number {
    let total = 0;
    for (const minutes of this.minutesByDay.values()) total += minutes;
    return total;
  }

  /**
   * 현재 연속일 — 오늘부터 거슬러 끊김 없이 읽은 날의 수.
   * 오늘 아직 안 읽었으면 어제부터 센다(오늘이 연속을 끊은 것은 아니므로).
   */
  get currentStreak(): number {
    let cursor = this.minutesByDay.has(this.todayKey)
      ? this.todayKey
      : previousReadingDayKey(this.todayKey);
    let streak = 0;
    while (this.minutesByDay.has(cursor)) {
      streak += 1;
      cursor = previousReadingDayKey(cursor);
    }
    return streak;
  }

  /** 특정 월(연, 1~12월)에 읽은 날(일)의 목록 — 오름차순. 캘린더 하이트맵용. */
  readDaysOf(year: number, month: number): number[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const days: number[] = [];
    for (const key of this.minutesByDay.keys()) {
      if (key.startsWith(prefix)) days.push(Number(key.slice(prefix.length)));
    }
    return days.sort((a, b) => a - b);
  }

  /** 특정 월에 읽은 날의 수. */
  monthReadCount(year: number, month: number): number {
    return this.readDaysOf(year, month).length;
  }

  /** 특정 월의 누적 독서 분. */
  monthMinutes(year: number, month: number): number {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    let total = 0;
    for (const [key, minutes] of this.minutesByDay) {
      if (key.startsWith(prefix)) total += minutes;
    }
    return total;
  }

  /** 특정 날(연, 1~12월, 일)에 읽었는지. */
  hasReadOn(year: number, month: number, day: number): boolean {
    return this.minutesByDay.has(readingDayKeyOf(year, month, day));
  }
}
