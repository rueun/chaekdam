import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';

/**
 * 책장 저장·조회 Port — 도메인이 정의하는 영속성 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공(SupabaseBookRepository).
 * 소유 범위(본인 책장)는 Adapter/RLS 가 보장한다.
 */
export interface BookRepository {
  /** 책을 저장한다(신규 등록 또는 상태 변경 반영). */
  save(book: Book): Promise<void>;
  /** id 로 책을 조회한다. 없으면 null. */
  findById(id: string): Promise<Book | null>;
  /** 책장 전체를 최신순으로 조회한다. */
  findAll(): Promise<Book[]>;
  /** 특정 상태(읽는 중/완독/위시/쉬는 중)의 책을 최신순으로 조회한다. */
  findByStatus(status: BookStatus): Promise<Book[]>;
}
