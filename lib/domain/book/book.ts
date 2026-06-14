import { generateId } from '@/lib/domain/shared/id';
import { EmptyBookTitleError, BookTitleTooLongError } from '@/lib/domain/shared/errors';
import { BookStatus } from './book-status';

/** 책 제목 최대 길이 */
export const BOOK_TITLE_MAX_LENGTH = 300;

/**
 * 책 — 책장(shelf)에 담긴 책의 메타 + 상태(ADR-007 하이브리드 토론용 메타).
 *
 * 불변 객체. 외부에서 직접 생성하지 않고 정적 팩토리(`register`/`restore`)로만 만든다.
 * 상태 변경(책장 이동)은 새 객체를 반환한다(원본 불변).
 */
export class Book {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly author: string,
    readonly status: BookStatus,
    /** 표지 색(디자인 토큰 CSS color). 없으면 null */
    readonly coverColor: string | null,
    /** 표지 이미지 URL(도서 API 썸네일). 없으면 null → 색 스파인으로 폴백 */
    readonly coverImageUrl: string | null,
    readonly createdAt: Date,
  ) {
    Object.freeze(this);
  }

  /** 책장에 새로 담는다(기본 상태는 WISH — 읽고 싶은). */
  static register(props: {
    title: string;
    author?: string;
    status?: BookStatus;
    coverColor?: string | null;
    coverImageUrl?: string | null;
  }): Book {
    return new Book(
      generateId(),
      normalizeTitle(props.title),
      // 저자 미상(익명)·미제공은 빈 문자열 허용 — 도서 API 가 저자를 안 줄 수 있음
      props.author?.trim() ?? '',
      props.status ?? BookStatus.WISH,
      props.coverColor ?? null,
      props.coverImageUrl ?? null,
      new Date(),
    );
  }

  /**
   * 저장소에서 읽어온 상태로 복원한다(Repository 전용).
   * 저장 시 이미 검증됐고(DB CHECK: 제목 1~300자), 재검증이 필요한 교차필드 구조 불변식이
   * 없으므로 저장된 값을 신뢰한다(Highlight.restore 와 동일 전략).
   */
  static restore(props: {
    id: string;
    title: string;
    author: string;
    status: BookStatus;
    coverColor: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
  }): Book {
    return new Book(
      props.id,
      props.title,
      props.author,
      props.status,
      props.coverColor,
      props.coverImageUrl,
      props.createdAt,
    );
  }

  /** 책장 상태를 바꾼 새 책을 반환한다(읽는 중/완독/위시/쉬는 중 이동). */
  withStatus(status: BookStatus): Book {
    if (status === this.status) return this;
    return new Book(
      this.id,
      this.title,
      this.author,
      status,
      this.coverColor,
      this.coverImageUrl,
      this.createdAt,
    );
  }
}

/**
 * 제목 정규화 + 불변식 검증(앞뒤 공백 제거, 비어있음·길이 제한).
 * 길이는 UTF-16 코드 유닛 기준(`String.length`) — DB 컬럼 길이와 맞추기 위한 상한이며
 * 사용자가 보는 글자 수와 미세하게 다를 수 있다(Highlight 와 동일 기준).
 */
function normalizeTitle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new EmptyBookTitleError();
  if (trimmed.length > BOOK_TITLE_MAX_LENGTH)
    throw new BookTitleTooLongError(BOOK_TITLE_MAX_LENGTH);
  return trimmed;
}
