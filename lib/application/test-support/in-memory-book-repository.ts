import type { Book } from '@/lib/domain/book/book';
import type { BookStatus } from '@/lib/domain/book/book-status';
import type { BookRepository } from '@/lib/domain/ports/book-repository';

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
  findAll(): Promise<Book[]> {
    return Promise.resolve(this.sortedByRecent());
  }
  findByStatus(status: BookStatus): Promise<Book[]> {
    return Promise.resolve(this.sortedByRecent().filter((b) => b.status === status));
  }

  /** Port 계약(최신순)을 Fake 도 충실히 재현 — 정렬 의존 버그를 테스트가 잡도록. */
  private sortedByRecent(): Book[] {
    return [...this.items.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
