import { ReadingLog } from '@/lib/domain/reading-log/reading-log';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';

/**
 * 독서 기록 조회(Query) — userId 소유 세션 전체를 모아 ReadingLog 투영으로 집계한다.
 * "오늘" 기준 시각을 진입점에서 주입받아 결정적으로 계산한다(테스트는 고정 시각 주입).
 * userId 소유 범위는 Repository 계약으로 명시(ADR-027) — RLS(1차)와 이중 방어.
 */
export class GetReadingLogUseCase {
  constructor(private readonly sessions: ReadingSessionRepository) {}

  async execute(userId: string, now: Date): Promise<ReadingLog> {
    const sessions = await this.sessions.findAll(userId);
    return ReadingLog.from(sessions, now);
  }
}
