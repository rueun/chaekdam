/**
 * 한 줄(Highlight)의 출처 — 값 객체(VO).
 * 사진에서 추출했는지, 직접 입력한 텍스트인지 구분한다.
 * 값으로 동등성을 판단하는 불변 값이라 문자열 리터럴 유니온으로 표현한다.
 */
export const NoteSource = {
  PHOTO: 'PHOTO',
  TEXT: 'TEXT',
} as const;

export type NoteSource = (typeof NoteSource)[keyof typeof NoteSource];
