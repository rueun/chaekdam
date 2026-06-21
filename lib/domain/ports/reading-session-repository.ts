import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';

/**
 * 독서 세션 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(SupabaseReadingSessionRepository).
 */
export interface ReadingSessionRepository {
  /** 독서 세션을 저장한다. */
  save(session: ReadingSession): Promise<void>;
  /**
   * userId 소유 세션 전체를 최근순(occurredAt 내림차순)으로 조회한다. ReadingLog 집계의 입력.
   * 소유 범위를 Port 계약에 명시(ADR-027) — RLS(1차)와 이중 방어.
   */
  findAll(userId: string): Promise<ReadingSession[]>;
  /** userId 소유 세션 중 특정 책의 것만 최근순으로 조회한다(책 상세). */
  findByBookId(userId: string, bookId: string): Promise<ReadingSession[]>;
}
