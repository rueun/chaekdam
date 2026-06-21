import type { Book } from '@/lib/domain/book/book';
import type { Specification } from '@/lib/domain/shared/specification';

/**
 * 소유권 Specification(ADR-004/027) — 책이 해당 사용자의 책장에 속하는지.
 * RLS(1차)와 같은 규칙을 도메인에서 한 번 더 표현해, 백엔드 분리(RLS 부재) 시에도 권한이 유지된다.
 */
export class OwnedBy implements Specification<Book> {
  constructor(private readonly userId: string) {}

  isSatisfiedBy(book: Book): boolean {
    return book.ownerId === this.userId;
  }
}
