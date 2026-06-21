/**
 * Specification 패턴의 공통 계약(ADR-004) — 도메인 규칙/권한을 객체로 표현한다.
 * 후보(candidate)가 규칙을 만족하는지 판정한다. 구현체는 각 도메인의 specs 폴더에 둔다.
 */
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}
