import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightPage, HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { OwnedBy } from '@/lib/domain/highlight/specs/owned-by';

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

  findByBookId(userId: string, bookId: string): Promise<Highlight[]> {
    return Promise.resolve(this.ownedBy(userId).filter((h) => h.bookId === bookId));
  }

  findAll(userId: string, page?: HighlightPage): Promise<Highlight[]> {
    // 보관 제외 + 고정 우선, 그 안에서 최신순(어댑터 findAll 정렬과 일치).
    // ownedBy 가 createdAt 최신순으로 준 배열에 고정 우선을 안정 정렬로 덧입힌다(원본 비변형).
    const active = this.ownedBy(userId).filter((h) => !h.archived);
    const sorted = [...active].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    return Promise.resolve(paginate(sorted, page));
  }

  findArchived(userId: string, page?: HighlightPage): Promise<Highlight[]> {
    return Promise.resolve(
      paginate(
        this.ownedBy(userId).filter((h) => h.archived),
        page,
      ),
    );
  }

  remove(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }

  /** userId 소유분만 최신순으로(소유 범위 — RLS 없는 Fake 에서 OwnedBy 로 명시 필터, ADR-027). */
  private ownedBy(userId: string): Highlight[] {
    const owned = new OwnedBy(userId);
    return [...this.items.values()]
      .filter((h) => owned.isSatisfiedBy(h))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
