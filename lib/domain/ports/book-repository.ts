import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';

/**
 * 책장 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공(SupabaseBookRepository).
 */
export interface BookRepository {
  /** 책을 저장한다(신규 등록 또는 상태 변경 반영). */
  save(book: Book): Promise<void>;
  /** id 로 책을 조회한다. 없으면 null(소유권은 mutate 유스케이스의 loadOwnedBook 이 검증). */
  findById(id: string): Promise<Book | null>;
  /**
   * userId 책장 전체를 최신순으로 조회한다.
   * 소유 범위를 Port 계약에 명시(ADR-027) — RLS(1차)와 이중 방어.
   */
  findAll(userId: string): Promise<Book[]>;
  /** userId 책장 중 특정 상태(읽는 중/완독/위시/쉬는 중)의 책을 최신순으로 조회한다. */
  findByStatus(userId: string, status: BookStatus): Promise<Book[]>;
  /** 책을 책장에서 제거한다(그 책에 딸린 한 줄도 함께 정리된다). */
  remove(id: string): Promise<void>;
}
