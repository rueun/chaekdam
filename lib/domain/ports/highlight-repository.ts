import type { Highlight } from '@/lib/domain/highlight/highlight';

/**
 * 한 줄 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(예: SupabaseHighlightRepository).
 * 도메인·유스케이스는 이 인터페이스에만 의존한다.
 */
export interface HighlightRepository {
  /** 한 줄을 저장한다(신규/갱신). */
  save(highlight: Highlight): Promise<void>;
  /** id 로 한 줄을 조회한다. 없으면 null. */
  findById(id: string): Promise<Highlight | null>;
  /** 특정 책의 한 줄 목록을 최신순으로 조회한다. */
  findByBookId(bookId: string): Promise<Highlight[]>;
  /** 보관하지 않은 한 줄 목록(고정 우선, 그 안에서 최신순). 소유 범위는 Adapter/RLS 가 보장. */
  findAll(): Promise<Highlight[]>;
  /** 보관한 한 줄 목록을 최신순으로 조회한다(보관함). */
  findArchived(): Promise<Highlight[]>;
  /** 한 줄을 삭제한다(소유 범위는 Adapter/RLS 가 보장). */
  remove(id: string): Promise<void>;
}
