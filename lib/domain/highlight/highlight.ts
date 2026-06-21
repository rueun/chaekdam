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
/** 한 줄당 태그 최대 개수 */
export const HIGHLIGHT_MAX_TAGS = 10;
/** 태그 1개 최대 길이 */
export const HIGHLIGHT_TAG_MAX_LENGTH = 30;

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
    /** 소유자(사용자) id — 권한 이중 방어의 기준(ADR-004/027) */
    readonly ownerId: string,
    readonly bookId: string,
    readonly source: NoteSource,
    readonly content: string,
    readonly photoUrl: string | null,
    readonly page: string | null,
    readonly createdAt: Date,
    /** 홈/목록 상단 고정 여부(ADR-021) */
    readonly pinned: boolean,
    /** 보관 여부 — 기본 목록에서 숨기고 보관함에서만 보인다(ADR-021) */
    readonly archived: boolean,
    /** 자유 입력 태그(ADR-023) — 정규화·동결됨 */
    readonly tags: readonly string[],
  ) {
    Object.freeze(this.tags);
    Object.freeze(this);
  }

  /** 직접 입력한 텍스트로 한 줄을 만든다(ownerId = 만든 사용자). */
  static fromText(
    ownerId: string,
    bookId: string,
    content: string,
    page: string | null = null,
    tags: readonly string[] = [],
  ): Highlight {
    return new Highlight(
      generateId(),
      ownerId,
      bookId,
      NoteSource.TEXT,
      normalizeContent(content),
      null,
      page,
      new Date(),
      false,
      false,
      normalizeTags(tags),
    );
  }

  /** 사진에서 추출한 구절로 한 줄을 만든다(ownerId = 만든 사용자). */
  static fromPhoto(
    ownerId: string,
    bookId: string,
    photoUrl: string,
    extractedText: string,
    page: string | null = null,
    tags: readonly string[] = [],
  ): Highlight {
    const url = photoUrl.trim();
    if (!url) throw new MissingPhotoUrlError();
    return new Highlight(
      generateId(),
      ownerId,
      bookId,
      NoteSource.PHOTO,
      normalizeContent(extractedText),
      url,
      page,
      new Date(),
      false,
      false,
      normalizeTags(tags),
    );
  }

  /**
   * 저장소에서 읽어온 상태로 복원한다(Repository 전용).
   * 본문 정규화는 신뢰(저장 시 이미 검증됨)하되, "항상 유효한 엔티티" 보장을 위해
   * 깨질 수 있는 구조 불변식(사진 출처는 photoUrl 필수)은 복원 시에도 검증한다.
   */
  static restore(props: {
    id: string;
    ownerId: string;
    bookId: string;
    source: NoteSource;
    content: string;
    photoUrl: string | null;
    page: string | null;
    createdAt: Date;
    pinned?: boolean;
    archived?: boolean;
    tags?: readonly string[];
  }): Highlight {
    if (props.source === NoteSource.PHOTO && !props.photoUrl) {
      throw new MissingPhotoUrlError();
    }
    return new Highlight(
      props.id,
      props.ownerId,
      props.bookId,
      props.source,
      props.content,
      props.photoUrl,
      props.page,
      props.createdAt,
      props.pinned ?? false,
      props.archived ?? false,
      // 멱등 정규화 — 저장 당시 규칙과 달라졌거나 마이그레이션으로 오염된 행도 항상 유효하게.
      normalizeTags(props.tags ?? []),
    );
  }

  /**
   * 본문·페이지·태그를 수정한 새 한 줄을 반환한다(원본 불변).
   * 본문은 재정규화·재검증한다. 출처·사진·식별자·생성시각·고정/보관 상태는 유지한다.
   */
  edit(props: { content: string; page?: string | null; tags?: readonly string[] }): Highlight {
    return new Highlight(
      this.id,
      this.ownerId,
      this.bookId,
      this.source,
      normalizeContent(props.content),
      this.photoUrl,
      // undefined = 페이지 유지, null = 명시적으로 지움.
      props.page === undefined ? this.page : props.page,
      this.createdAt,
      this.pinned,
      this.archived,
      // undefined = 태그 유지, 배열 = 교체.
      props.tags === undefined ? this.tags : normalizeTags(props.tags),
    );
  }

  /** 다른 책으로 옮긴 새 한 줄을 반환한다(원본 불변). */
  moveTo(bookId: string): Highlight {
    const target = bookId.trim();
    if (!target) throw new EmptyBookIdError();
    return this.copyWith({ bookId: target });
  }

  /** 고정한 새 한 줄을 반환한다(원본 불변). */
  pin(): Highlight {
    return this.copyWith({ pinned: true });
  }

  /** 고정을 해제한 새 한 줄을 반환한다(원본 불변). */
  unpin(): Highlight {
    return this.copyWith({ pinned: false });
  }

  /** 보관한 새 한 줄을 반환한다(원본 불변). 보관 시 고정은 해제한다. */
  archive(): Highlight {
    return this.copyWith({ archived: true, pinned: false });
  }

  /** 보관을 해제한 새 한 줄을 반환한다(원본 불변). */
  unarchive(): Highlight {
    return this.copyWith({ archived: false });
  }

  /** 사진 출처 여부 */
  isFromPhoto(): boolean {
    return this.source === NoteSource.PHOTO;
  }

  /** 본문·페이지·태그를 제외한 메타(책·고정·보관)만 바꾼 새 한 줄을 만든다(내부 전용). */
  private copyWith(changes: { bookId?: string; pinned?: boolean; archived?: boolean }): Highlight {
    return new Highlight(
      this.id,
      this.ownerId,
      changes.bookId ?? this.bookId,
      this.source,
      this.content,
      this.photoUrl,
      this.page,
      this.createdAt,
      changes.pinned ?? this.pinned,
      changes.archived ?? this.archived,
      this.tags,
    );
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

/**
 * 태그 정규화 — 공백 제거·빈/과길이 제거·대소문자 무시 중복 제거·개수 상한.
 * 자유 입력이라 예외 대신 정규화로 흡수한다(원본 표기는 유지, 중복 판정만 소문자 기준).
 */
function normalizeTags(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of raw) {
    const trimmed = tag.trim();
    if (!trimmed || trimmed.length > HIGHLIGHT_TAG_MAX_LENGTH) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= HIGHLIGHT_MAX_TAGS) break;
  }
  return result;
}
