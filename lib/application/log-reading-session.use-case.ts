import { ReadingSession } from '@/lib/domain/reading-log/reading-session';
import type { ReadingSessionRepository } from '@/lib/domain/ports/reading-session-repository';

/** 독서 세션 기록 명령 — 읽은 분 + 선택적 페이지 범위/발생 시각. */
export interface LogReadingSessionCommand {
  bookId: string;
  minutes: number;
  startPage?: number | null;
  endPage?: number | null;
  occurredAt?: Date;
}

export interface LogReadingSessionResult {
  sessionId: string;
}

/**
 * 독서 세션 기록 유스케이스 — 입력을 도메인 ReadingSession 으로 만들고(불변식 강제) 저장한다.
 * 트랜잭션 경계 = ReadingSession Aggregate 1개. Port 만 의존(구현체 모름).
 */
export class LogReadingSessionUseCase {
  constructor(private readonly sessions: ReadingSessionRepository) {}

  async execute(command: LogReadingSessionCommand): Promise<LogReadingSessionResult> {
    const session = ReadingSession.log(command);
    await this.sessions.save(session);
    return { sessionId: session.id };
  }
}
