/**
 * 책장(shelf) 상태 — 값 객체(VO). 위시리스트 = WISH.
 * 도메인은 대문자 키로 표현하고, 표현 계층에서 소문자 키('reading' 등)로 매핑한다.
 */
export const BookStatus = {
  READING: 'READING',
  DONE: 'DONE',
  WISH: 'WISH',
  PAUSED: 'PAUSED',
} as const;

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus];
