import { generateId } from '@/lib/domain/shared/id';
import { InvalidSessionMinutesError, InvalidPageRangeError } from '@/lib/domain/shared/errors';

/** 한 세션의 최대 시간(분) — 하루(24h) */
export const READING_SESSION_MAX_MINUTES = 24 * 60;

/**
 * 독서 세션 — 한 번의 읽기(리더 체류 '분' + 선택적 페이지 범위). 책별로 쌓여
 * 일자별 기록·연속일·통계(ReadingLog)로 집계된다(ADR-010/012). 독립 Aggregate.
 *
 * 불변 객체. 정적 팩토리(log/restore)로만 생성하며 불변식을 생성 시 강제한다.
 */
export class ReadingSession {
  private constructor(
    readonly id: string,
    /** 소유자(기록한 사용자) — 권한 이중 방어(ADR-027). 생성 시 고정. */
    readonly ownerId: string,
    readonly bookId: string,
    /** 읽은 시간(분) */
    readonly minutes: number,
    readonly startPage: number | null,
    readonly endPage: number | null,
    /** 세션이 일어난 시각(통계·연속일 집계 기준) */
    readonly occurredAt: Date,
    readonly createdAt: Date,
  ) {
    Object.freeze(this);
  }

  /** 새 독서 세션을 기록한다. ownerId 가 기록 소유자가 된다. */
  static log(props: {
    ownerId: string;
    bookId: string;
    minutes: number;
    startPage?: number | null;
    endPage?: number | null;
    occurredAt?: Date;
  }): ReadingSession {
    // occurredAt 미지정 시 현재 시각으로 집계(과거/미래 날짜 기록은 명시).
    const minutes = normalizeMinutes(props.minutes);
    const [startPage, endPage] = normalizePages(props.startPage ?? null, props.endPage ?? null);
    const now = new Date();
    return new ReadingSession(
      generateId(),
      props.ownerId,
      props.bookId,
      minutes,
      startPage,
      endPage,
      props.occurredAt ?? now,
      now,
    );
  }

  /**
   * 저장소에서 읽어온 상태로 복원한다(Repository 전용).
   * 값(분·페이지 값)은 저장 시 검증됐으므로 신뢰하되, "항상 유효한 엔티티" 보장을 위해
   * 교차필드 구조 불변식(페이지는 둘 다 있거나 둘 다 없음)은 복원 시에도 확인한다
   * (Highlight.restore 와 동일 전략).
   */
  static restore(props: {
    id: string;
    ownerId: string;
    bookId: string;
    minutes: number;
    startPage: number | null;
    endPage: number | null;
    occurredAt: Date;
    createdAt: Date;
  }): ReadingSession {
    if ((props.startPage === null) !== (props.endPage === null)) {
      throw new InvalidPageRangeError();
    }
    return new ReadingSession(
      props.id,
      props.ownerId,
      props.bookId,
      props.minutes,
      props.startPage,
      props.endPage,
      props.occurredAt,
      props.createdAt,
    );
  }

  /** 페이지 범위 크기(end − start). 같은 페이지면 0, 범위가 없으면 null. */
  get pageSpan(): number | null {
    return this.startPage !== null && this.endPage !== null ? this.endPage - this.startPage : null;
  }
}

/** 분 검증 — 정수(타이머가 분 단위로 반올림)·양수·하루 이내. NaN/Infinity 는 isInteger 가 false 라 함께 차단된다. */
function normalizeMinutes(minutes: number): number {
  if (!Number.isInteger(minutes) || minutes <= 0 || minutes > READING_SESSION_MAX_MINUTES) {
    throw new InvalidSessionMinutesError();
  }
  return minutes;
}

/** 페이지 범위 검증 — 둘 다 없거나(null), 둘 다 정수이며 0 ≤ start ≤ end. */
function normalizePages(
  startPage: number | null,
  endPage: number | null,
): [number | null, number | null] {
  if (startPage === null && endPage === null) return [null, null];
  if (startPage === null || endPage === null) throw new InvalidPageRangeError();
  if (!Number.isInteger(startPage) || !Number.isInteger(endPage)) throw new InvalidPageRangeError();
  if (startPage < 0 || endPage < startPage) throw new InvalidPageRangeError();
  return [startPage, endPage];
}
