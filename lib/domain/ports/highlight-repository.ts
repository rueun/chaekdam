import type { Highlight } from '@/lib/domain/highlight/highlight';

/** 목록 페이지 옵션(ADR-025) — 미지정 시 어댑터 기본 상한. */
export interface HighlightPage {
  limit?: number;
  offset?: number;
}

/**
 * 한 줄 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(예: SupabaseHighlightRepository).
 * 도메인·유스케이스는 이 인터페이스에만 의존한다.
 */
export interface HighlightRepository {
  /** 한 줄을 저장한다(신규/갱신). */
  save(highlight: Highlight): Promise<void>;
  /** id 로 한 줄을 조회한다. 없으면 null(소유권은 mutate 유스케이스의 loadOwnedHighlight 가 검증). */
  findById(id: string): Promise<Highlight | null>;
  /** userId 소유 한 줄 중 특정 책의 목록을 최신순으로 조회한다. */
  findByBookId(userId: string, bookId: string): Promise<Highlight[]>;
  /**
   * userId 소유의 보관하지 않은 한 줄 목록(고정 우선, 그 안에서 최신순).
   * 소유 범위를 Port 계약에 명시(ADR-027) — RLS(1차)와 이중 방어.
   */
  findAll(userId: string, page?: HighlightPage): Promise<Highlight[]>;
  /** userId 소유의 보관한 한 줄 목록을 최신순으로 조회한다(보관함). */
  findArchived(userId: string, page?: HighlightPage): Promise<Highlight[]>;
  /** userId 소유의 한 줄만 삭제한다(ADR-027 — RLS 와 이중 방어). */
  remove(id: string, userId: string): Promise<void>;
}
