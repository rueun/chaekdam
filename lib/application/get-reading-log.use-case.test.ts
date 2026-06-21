import { describe, it, expect } from 'vitest';
import { GetReadingLogUseCase } from './get-reading-log.use-case';
import { LogReadingSessionUseCase } from './log-reading-session.use-case';
import { InMemoryReadingSessionRepository } from './test-support/in-memory-reading-session-repository';

// 기준 오늘 = KST 2026-06-07 (UTC 03:00 = 정오 KST)
const TODAY = new Date(Date.UTC(2026, 5, 7, 3, 0, 0));
const onDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 3, 0, 0));

describe('GetReadingLogUseCase', () => {
  it('저장된 세션들을 ReadingLog 투영으로 집계한다', async () => {
    const repo = new InMemoryReadingSessionRepository();
    const log = new LogReadingSessionUseCase(repo);
    await log.execute({
      userId: 'owner',
      bookId: 'b1',
      minutes: 40,
      occurredAt: onDay(2026, 6, 7),
    });
    await log.execute({
      userId: 'owner',
      bookId: 'b1',
      minutes: 25,
      occurredAt: onDay(2026, 6, 6),
    });

    const readingLog = await new GetReadingLogUseCase(repo).execute('owner', TODAY);

    expect(readingLog.minutesToday).toBe(40);
    expect(readingLog.currentStreak).toBe(2);
    expect(readingLog.monthReadCount(2026, 6)).toBe(2);
  });

  it('타인의 세션은 집계에 섞이지 않는다(ADR-027, RLS 없이도 소유 범위)', async () => {
    const repo = new InMemoryReadingSessionRepository();
    const log = new LogReadingSessionUseCase(repo);
    await log.execute({
      userId: 'owner',
      bookId: 'b1',
      minutes: 40,
      occurredAt: onDay(2026, 6, 7),
    });
    await log.execute({
      userId: 'intruder',
      bookId: 'b1',
      minutes: 99,
      occurredAt: onDay(2026, 6, 7),
    });

    const readingLog = await new GetReadingLogUseCase(repo).execute('owner', TODAY);
    expect(readingLog.minutesToday).toBe(40); // 남의 99 분은 제외
    expect(readingLog.totalMinutes).toBe(40);
  });

  it('기록이 없으면 빈 투영을 반환한다', async () => {
    const repo = new InMemoryReadingSessionRepository();
    const readingLog = await new GetReadingLogUseCase(repo).execute('owner', TODAY);

    expect(readingLog.minutesToday).toBe(0);
    expect(readingLog.currentStreak).toBe(0);
    expect(readingLog.totalMinutes).toBe(0);
  });
});
