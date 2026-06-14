/**
 * 토론 발화 주체 — 값 객체(VO). 사용자(USER) 또는 AI(AI).
 * 값으로 동등성을 판단하는 불변 값이라 문자열 리터럴 유니온으로 표현한다.
 * 도메인은 대문자 키로 표현하고, 표현 계층에서 필요 시 매핑한다.
 */
export const Role = {
  USER: 'USER',
  AI: 'AI',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
