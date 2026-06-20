import { generateId } from '@/lib/domain/shared/id';
import {
  EmptyBookIdError,
  EmptyHighlightContentError,
  HighlightContentTooLongError,
  MissingPhotoUrlError,
} from '@/lib/domain/shared/errors';
import { NoteSource } from './note-source';

/** 한 줄 본문 최대 길이 */
export const HIGHLIGHT_CONTENT_MAX_LENGTH = 5000;

/**
 * 한 줄(Highlight) — 캡처한 인상 깊은 구절. 저널링의 핵심 단위(ADR-010).
 *
 * 불변 객체(모든 필드 readonly + 동결). 외부에서 직접 생성하지 않고
 * 정적 팩토리(`fromText`/`fromPhoto`/`restore`)로만 만든다.
 * 불변식(본문 비어있지 않음·길이 제한·사진 출처는 URL 필수)은 생성 시 강제한다.
 */
export class Highlight {
  private constructor(
    readonly id: string,
    readonly bookId: string,
    readonly source: NoteSource,
    readonly content: string,
    readonly photoUrl: string | null,
    readonly page: string | null,
    readonly createdAt: Date,
  ) {
    Object.freeze(this);
  }

  /** 직접 입력한 텍스트로 한 줄을 만든다. */
  static fromText(bookId: string, content: string, page: string | null = null): Highlight {
    const normalized = normalizeContent(content);
    return new Highlight(generateId(), bookId, NoteSource.TEXT, normalized, null, page, new Date());
  }

  /** 사진에서 추출한 구절로 한 줄을 만든다. */
  static fromPhoto(
    bookId: string,
    photoUrl: string,
    extractedText: string,
    page: string | null = null,
  ): Highlight {
    const url = photoUrl.trim();
    if (!url) throw new MissingPhotoUrlError();
    const normalized = normalizeContent(extractedText);
    return new Highlight(generateId(), bookId, NoteSource.PHOTO, normalized, url, page, new Date());
  }

  /**
   * 저장소에서 읽어온 상태로 복원한다(Repository 전용).
   * 본문 정규화는 신뢰(저장 시 이미 검증됨)하되, "항상 유효한 엔티티" 보장을 위해
   * 깨질 수 있는 구조 불변식(사진 출처는 photoUrl 필수)은 복원 시에도 검증한다.
   */
  static restore(props: {
    id: string;
    bookId: string;
    source: NoteSource;
    content: string;
    photoUrl: string | null;
    page: string | null;
    createdAt: Date;
  }): Highlight {
    if (props.source === NoteSource.PHOTO && !props.photoUrl) {
      throw new MissingPhotoUrlError();
    }
    return new Highlight(
      props.id,
      props.bookId,
      props.source,
      props.content,
      props.photoUrl,
      props.page,
      props.createdAt,
    );
  }

  /**
   * 본문·페이지를 수정한 새 한 줄을 반환한다(원본 불변).
   * 본문은 재정규화·재검증한다. 출처·사진·식별자·생성시각은 유지한다.
   */
  edit(props: { content: string; page?: string | null }): Highlight {
    return new Highlight(
      this.id,
      this.bookId,
      this.source,
      normalizeContent(props.content),
      this.photoUrl,
      // undefined = 페이지 유지, null = 명시적으로 지움.
      props.page === undefined ? this.page : props.page,
      this.createdAt,
    );
  }

  /** 다른 책으로 옮긴 새 한 줄을 반환한다(원본 불변). 본문·출처·사진·식별자·생성시각 유지. */
  moveTo(bookId: string): Highlight {
    const target = bookId.trim();
    if (!target) throw new EmptyBookIdError();
    return new Highlight(
      this.id,
      target,
      this.source,
      this.content,
      this.photoUrl,
      this.page,
      this.createdAt,
    );
  }

  /** 사진 출처 여부 */
  isFromPhoto(): boolean {
    return this.source === NoteSource.PHOTO;
  }
}

/**
 * 본문 정규화 + 불변식 검증(앞뒤 공백 제거, 비어있음·길이 제한).
 * 길이는 UTF-16 코드 유닛 기준(`String.length`) — 저장소 컬럼 길이와 맞추기 위한 상한이며,
 * 사용자가 보는 글자 수와 미세하게 다를 수 있다(이모지 등).
 */
function normalizeContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new EmptyHighlightContentError();
  if (trimmed.length > HIGHLIGHT_CONTENT_MAX_LENGTH) {
    throw new HighlightContentTooLongError(HIGHLIGHT_CONTENT_MAX_LENGTH);
  }
  return trimmed;
}
