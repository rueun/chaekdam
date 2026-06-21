import type { Discussion } from '@/lib/domain/discussion/discussion';

/**
 * 토론 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(SupabaseDiscussionRepository).
 */
export interface DiscussionRepository {
  /**
   * 토론(Aggregate)을 저장한다 — 방 upsert + 메시지 저장. 메시지는 불변 + 고유 id 이므로
   * 어댑터는 id 기준 insert-or-skip(예: Supabase ON CONFLICT DO NOTHING)으로 구현할 수 있다.
   */
  save(discussion: Discussion): Promise<void>;
  /** id 로 토론을 메시지까지 포함해 조회한다. 없으면 null(소유권은 loadOwnedDiscussion 이 검증). */
  findById(id: string): Promise<Discussion | null>;
  /**
   * userId 소유의 토론 목록을 최신순으로 조회한다(MVP는 메시지 포함).
   * 소유 범위를 Port 계약에 명시(ADR-027) — RLS(1차)와 이중 방어.
   */
  findAll(userId: string): Promise<Discussion[]>;
  /** userId 소유의 토론 중 특정 책의 것만 최신순으로 조회한다(책 상세, 메시지 포함). */
  findByBookId(userId: string, bookId: string): Promise<Discussion[]>;
}
