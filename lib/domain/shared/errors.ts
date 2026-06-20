/**
 * 도메인 예외 — 비즈니스 규칙 위반을 표현한다.
 * 기술 예외와 구분되며, 계층 경계에서 적절한 응답으로 변환된다.
 * 메시지는 운영 도구 호환을 위해 영어로 작성한다(language 규칙).
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** 한 줄 본문이 비어 있음 */
export class EmptyHighlightContentError extends DomainError {
  constructor() {
    super('Highlight content must not be empty');
  }
}

/** 한 줄 본문이 허용 길이를 초과함 */
export class HighlightContentTooLongError extends DomainError {
  constructor(maxLength: number) {
    super(`Highlight content must be at most ${maxLength} characters`);
  }
}

/** 사진 출처인데 사진 URL이 없음 */
export class MissingPhotoUrlError extends DomainError {
  constructor() {
    super('Photo highlight requires a photo URL');
  }
}

/** 책 제목이 비어 있음 */
export class EmptyBookTitleError extends DomainError {
  constructor() {
    super('Book title must not be empty');
  }
}

/** 책 제목이 허용 길이를 초과함 */
export class BookTitleTooLongError extends DomainError {
  constructor(maxLength: number) {
    super(`Book title must be at most ${maxLength} characters`);
  }
}

/** 책을 찾을 수 없음 */
export class BookNotFoundError extends DomainError {
  constructor(bookId: string) {
    super(`Book not found: ${bookId}`);
  }
}

/** 한 줄을 찾을 수 없음 */
export class HighlightNotFoundError extends DomainError {
  constructor(highlightId: string) {
    super(`Highlight not found: ${highlightId}`);
  }
}

/** 책 식별자가 비어 있음(이동 대상 미지정 등) */
export class EmptyBookIdError extends DomainError {
  constructor() {
    super('Book id must not be empty');
  }
}

/** 독서 세션 시간(분)이 유효하지 않음 */
export class InvalidSessionMinutesError extends DomainError {
  constructor() {
    super('Reading session minutes must be a positive number within a day');
  }
}

/** 독서 세션 페이지 범위가 유효하지 않음 */
export class InvalidPageRangeError extends DomainError {
  constructor() {
    super('Page range must have both start and end as non-negative integers with start <= end');
  }
}

/** 토론 메시지 본문이 비어 있음 */
export class EmptyMessageContentError extends DomainError {
  constructor() {
    super('Message content must not be empty');
  }
}

/** 토론 메시지 본문이 허용 길이를 초과함 */
export class MessageContentTooLongError extends DomainError {
  constructor(max: number) {
    super(`Message content must be at most ${max} characters`);
  }
}

/** 선택할 수 없는(보류·비활성) 페르소나로 토론을 시작하려 함 */
export class PersonaNotAvailableError extends DomainError {
  constructor(personaKey: string) {
    super(`Persona is not available for discussion: ${personaKey}`);
  }
}

/** 토론을 찾을 수 없음 */
export class DiscussionNotFoundError extends DomainError {
  constructor(discussionId: string) {
    super(`Discussion not found: ${discussionId}`);
  }
}
