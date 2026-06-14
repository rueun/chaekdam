/**
 * 책장 보유 판정 키 — 제목+저자를 정규화한 값.
 * Book 에 ISBN 을 저장하지 않으므로(ADR-016) 검색 결과와 보유 책을 제목·저자로 매칭한다.
 * 서버(보유 목록)와 클라이언트(검색 결과)가 같은 규칙을 쓰도록 공용 함수로 둔다.
 */
export function ownedBookKey(title: string, author: string): string {
  return `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;
}
