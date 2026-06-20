import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightPage, HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 정렬된 목록에 페이지(offset/limit)를 적용한다. */
function paginate(items: Highlight[], page?: HighlightPage): Highlight[] {
  const offset = Math.max(0, page?.offset ?? 0);
  return page?.limit === undefined ? items.slice(offset) : items.slice(offset, offset + page.limit);
}

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

  findAll(page?: HighlightPage): Promise<Highlight[]> {
    // 보관 제외 + 고정 우선, 그 안에서 최신순(어댑터 findAll 정렬과 일치).
    const active = this.sortedByRecent().filter((h) => !h.archived);
    const sorted = active.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    return Promise.resolve(paginate(sorted, page));
  }

  findArchived(page?: HighlightPage): Promise<Highlight[]> {
    return Promise.resolve(
      paginate(
        this.sortedByRecent().filter((h) => h.archived),
        page,
      ),
    );
  }

  remove(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }

  private sortedByRecent(): Highlight[] {
    return [...this.items.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
