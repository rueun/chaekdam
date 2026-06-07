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
