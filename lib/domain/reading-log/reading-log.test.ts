import { describe, it, expect } from 'vitest';
import { ReadingLog } from './reading-log';
import { ReadingSession } from './reading-session';

/** 지정한 KST 날짜의 정오에 일어난 세션을 만든다. */
function sessionOn(year: number, month: number, day: number, minutes: number): ReadingSession {
  // 정오 KST = UTC 03:00 — 자정 경계에서 멀어 날짜 환산이 안정적.
  return ReadingSession.log({
    bookId: 'b1',
    minutes,
    occurredAt: new Date(Date.UTC(year, month - 1, day, 3, 0, 0)),
  });
}

// 기준 오늘 = KST 2026-06-07
const TODAY = new Date(Date.UTC(2026, 5, 7, 3, 0, 0));

describe('ReadingLog', () => {
  it('같은 날 세션들의 분을 합산한다(오늘 읽은 분)', () => {
    const log = ReadingLog.from([sessionOn(2026, 6, 7, 30), sessionOn(2026, 6, 7, 10)], TODAY);
    expect(log.minutesToday).toBe(40);
  });

  it('어제 대비 오늘 분의 증감을 계산한다', () => {
    const log = ReadingLog.from([sessionOn(2026, 6, 7, 40), sessionOn(2026, 6, 6, 25)], TODAY);
    expect(log.deltaMinutesFromYesterday).toBe(15);
  });

  it('전체 누적 분을 합산한다', () => {
    const log = ReadingLog.from(
      [sessionOn(2026, 6, 7, 40), sessionOn(2026, 6, 6, 25), sessionOn(2026, 5, 31, 15)],
      TODAY,
    );
    expect(log.totalMinutes).toBe(80);
  });

  describe('currentStreak', () => {
    it('오늘부터 끊김 없이 읽은 날을 센다', () => {
      const log = ReadingLog.from(
        [sessionOn(2026, 6, 7, 10), sessionOn(2026, 6, 6, 10), sessionOn(2026, 6, 5, 10)],
        TODAY,
      );
      expect(log.currentStreak).toBe(3);
    });

    it('중간에 끊기면 거기서 멈춘다', () => {
      const log = ReadingLog.from(
        [sessionOn(2026, 6, 7, 10), sessionOn(2026, 6, 5, 10)], // 6일 누락
        TODAY,
      );
      expect(log.currentStreak).toBe(1);
    });

    it('오늘 아직 안 읽었으면 어제부터 센다', () => {
      const log = ReadingLog.from(
        [sessionOn(2026, 6, 6, 10), sessionOn(2026, 6, 5, 10)], // 오늘(7일) 없음
        TODAY,
      );
      expect(log.currentStreak).toBe(2);
    });

    it('오늘도 어제도 안 읽었으면 0', () => {
      const log = ReadingLog.from([sessionOn(2026, 6, 4, 10)], TODAY);
      expect(log.currentStreak).toBe(0);
    });

    it('기록이 없으면 0', () => {
      expect(ReadingLog.from([], TODAY).currentStreak).toBe(0);
    });

    it('연 경계를 넘어 연속을 센다(12/31 → 1/1)', () => {
      const newYear = new Date(Date.UTC(2026, 0, 1, 3, 0, 0)); // KST 2026-01-01
      const log = ReadingLog.from(
        [sessionOn(2026, 1, 1, 10), sessionOn(2025, 12, 31, 10), sessionOn(2025, 12, 30, 10)],
        newYear,
      );
      expect(log.currentStreak).toBe(3);
    });
  });

  it('KST 자정 경계의 세션을 서로 다른 날로 집계한다', () => {
    // UTC 14:59(KST 6/6 23:59) 와 UTC 15:00(KST 6/7 00:00) — 하루 차이로 갈려야 한다.
    const lateNight = ReadingSession.log({
      bookId: 'b1',
      minutes: 10,
      occurredAt: new Date('2026-06-06T14:59:00Z'),
    });
    const justAfterMidnight = ReadingSession.log({
      bookId: 'b1',
      minutes: 20,
      occurredAt: new Date('2026-06-06T15:00:00Z'),
    });
    const log = ReadingLog.from([lateNight, justAfterMidnight], TODAY);
    expect(log.readDaysOf(2026, 6)).toEqual([6, 7]);
    expect(log.monthMinutes(2026, 6)).toBe(30);
  });

  describe('월별 집계', () => {
    const log = ReadingLog.from(
      [
        sessionOn(2026, 6, 7, 40),
        sessionOn(2026, 6, 6, 25),
        sessionOn(2026, 6, 5, 20),
        sessionOn(2026, 5, 31, 15),
      ],
      TODAY,
    );

    it('해당 월의 읽은 날을 오름차순으로 반환한다', () => {
      expect(log.readDaysOf(2026, 6)).toEqual([5, 6, 7]);
      expect(log.readDaysOf(2026, 5)).toEqual([31]);
    });

    it('해당 월에 읽은 날 수를 센다', () => {
      expect(log.monthReadCount(2026, 6)).toBe(3);
      expect(log.monthReadCount(2026, 4)).toBe(0);
    });

    it('해당 월의 누적 분을 합산한다', () => {
      expect(log.monthMinutes(2026, 6)).toBe(85);
      expect(log.monthMinutes(2026, 5)).toBe(15);
    });

    it('특정 날 읽음 여부를 판정한다', () => {
      expect(log.hasReadOn(2026, 6, 7)).toBe(true);
      expect(log.hasReadOn(2026, 6, 4)).toBe(false);
    });
  });

  it('투영 객체는 동결되어 있다', () => {
    expect(Object.isFrozen(ReadingLog.from([], TODAY))).toBe(true);
  });
});
