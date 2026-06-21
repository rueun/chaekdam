import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import { OwnedBy } from '@/lib/domain/book/specs/owned-by';

/**
 * 테스트용 In-Memory BookRepository — Mock 이 아닌 진짜 저장 동작(testing 규칙).
 * 유스케이스 단위 테스트에서 공유한다(외부 의존 0).
 */
export class InMemoryBookRepository implements BookRepository {
  private readonly items = new Map<string, Book>();

  save(book: Book): Promise<void> {
    // Book 은 불변 전체 객체라 id 기준 전체 교체가 곧 upsert(신규/갱신)
    this.items.set(book.id, book);
    return Promise.resolve();
  }
  findById(id: string): Promise<Book | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }
  findAll(userId: string): Promise<Book[]> {
    return Promise.resolve(this.ownedBy(userId));
  }
  findByStatus(userId: string, status: BookStatus): Promise<Book[]> {
    return Promise.resolve(this.ownedBy(userId).filter((b) => b.status === status));
  }
  remove(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }

  /** userId 소유분만 최신순으로(소유 범위 — RLS 없는 Fake 에서 OwnedBy 로 명시 필터, ADR-027). */
  private ownedBy(userId: string): Book[] {
    const owned = new OwnedBy(userId);
    return [...this.items.values()]
      .filter((b) => owned.isSatisfiedBy(b))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
