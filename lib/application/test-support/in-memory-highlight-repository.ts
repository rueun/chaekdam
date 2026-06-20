import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/**
 * 테스트용 In-Memory HighlightRepository — Mock 이 아닌 진짜 저장 동작(testing 규칙).
 */
export class InMemoryHighlightRepository implements HighlightRepository {
  private readonly items = new Map<string, Highlight>();

  save(highlight: Highlight): Promise<void> {
    this.items.set(highlight.id, highlight);
    return Promise.resolve();
  }

  findById(id: string): Promise<Highlight | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findByBookId(bookId: string): Promise<Highlight[]> {
    return Promise.resolve(this.sortedByRecent().filter((h) => h.bookId === bookId));
  }

  findAll(): Promise<Highlight[]> {
    // 보관 제외 + 고정 우선, 그 안에서 최신순(어댑터 findAll 정렬과 일치).
    const active = this.sortedByRecent().filter((h) => !h.archived);
    return Promise.resolve(active.sort((a, b) => Number(b.pinned) - Number(a.pinned)));
  }

  findArchived(): Promise<Highlight[]> {
    return Promise.resolve(this.sortedByRecent().filter((h) => h.archived));
  }

  remove(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }

  private sortedByRecent(): Highlight[] {
    return [...this.items.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
