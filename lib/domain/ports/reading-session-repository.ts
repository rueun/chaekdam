import type { ReadingSession } from '@/lib/domain/reading-log/reading-session';

/**
 * 독서 세션 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(SupabaseReadingSessionRepository).
 * 소유 범위(본인 세션)는 Adapter/RLS(Supabase 인증 컨텍스트)가 보장한다.
 * 백엔드 분리 시 명시적 소유자(findAllByUser(userId)) 형태로 진화할 수 있다.
 */
export interface ReadingSessionRepository {
  /** 독서 세션을 저장한다. */
  save(session: ReadingSession): Promise<void>;
  /** 세션 전체를 최근순(occurredAt 내림차순)으로 조회한다. ReadingLog 집계의 입력. */
  findAll(): Promise<ReadingSession[]>;
}
