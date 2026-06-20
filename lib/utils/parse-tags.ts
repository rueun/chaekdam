/**
 * 쉼표로 구분된 입력 문자열을 태그 배열로 파싱한다(UI 포맷 결정).
 * 정규화(중복 제거·개수/길이 상한)는 도메인 `normalizeTags` 가 담당한다.
 * 쉼표는 구분자라 태그 값에 포함할 수 없다(빈 토큰은 버린다).
 */
export function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
