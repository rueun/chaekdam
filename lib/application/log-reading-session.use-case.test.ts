import { describe, it, expect } from 'vitest';
import { LogReadingSessionUseCase } from './log-reading-session.use-case';
import { InMemoryReadingSessionRepository } from './test-support/in-memory-reading-session-repository';
import { InvalidSessionMinutesError } from '@/lib/domain/shared/errors';

describe('LogReadingSessionUseCase', () => {
  it('세션을 기록하고 저장한다', async () => {
    const repo = new InMemoryReadingSessionRepository();
    const result = await new LogReadingSessionUseCase(repo).execute({
      userId: 'owner',
      bookId: 'b1',
      minutes: 30,
    });

    expect(result.sessionId).toBeTruthy();
    const all = await repo.findAll('owner');
    expect(all).toHaveLength(1);
    expect(all[0]!.minutes).toBe(30);
    expect(all[0]!.bookId).toBe('b1');
    expect(all[0]!.ownerId).toBe('owner'); // userId 가 기록 소유자로 설정됨(ADR-027)
  });

  it('잘못된 분은 도메인 불변식으로 거부된다(저장 안 됨)', async () => {
    const repo = new InMemoryReadingSessionRepository();
    await expect(
      new LogReadingSessionUseCase(repo).execute({ userId: 'owner', bookId: 'b1', minutes: 0 }),
    ).rejects.toThrow(InvalidSessionMinutesError);
    expect(await repo.findAll('owner')).toHaveLength(0);
  });
});
