/**
 * 작가 사망 여부 판정(ADR-022) — '작가 본인' 페르소나는 사망 작가에 한해 활성된다(ADR-009/015).
 *
 * 외부 인물 데이터 소스(Wikidata 등)는 후속이고, MVP 는 시스템 큐레이션 목록으로 판정한다.
 * 페르소나처럼 시스템 정적 데이터라 코드 상수로 둔다(사용자가 만들지 않음).
 *
 * 판정 정책(보수적): 저자 필드를 구분자로 나눠 **모든 저자가 목록에 정확히 일치**할 때만 사망으로 본다.
 * 생존 작가를 잘못 활성화하는 오류가 가장 치명적이므로(저작권·윤리), 공동저자·역자가 섞이면 비활성한다.
 */
function normalize(name: string): string {
  return name.replace(/\s+/g, '');
}

const DECEASED_AUTHORS: ReadonlySet<string> = new Set(
  [
    '헤르만 헤세',
    '프란츠 카프카',
    '도스토옙스키',
    '톨스토이',
    '어니스트 헤밍웨이',
    '알베르 카뮈',
    '조지 오웰',
    '버지니아 울프',
    '제인 오스틴',
    '생텍쥐페리',
    '셰익스피어',
    '안톤 체호프',
    '나쓰메 소세키',
    '윤동주',
    '이상',
    '김유정',
    '현진건',
    '김소월',
    '한용운',
    '백석',
    '채만식',
    '이효석',
    '박경리',
    '박완서',
    '법정',
  ].map(normalize),
);

/** 저자 필드를 개별 저자명으로 나눈다(네이버 등은 `^ | , ;` 로 다중 저자를 구분). */
function splitAuthors(raw: string): string[] {
  return raw
    .split(/[|^,;/&·]/)
    .map(normalize)
    .filter((name) => name.length > 0);
}

/** 작가 판정 도메인 서비스(순수). */
export const Author = {
  /**
   * 사망(작가 본인 페르소나 허용) 작가인지. 다중 저자면 **모두** 사망이어야 한다.
   * 목록과 정확히 일치해야 하며(부분 일치 금지) 동명이인·제목 혼입 오탐을 막는다.
   */
  isDeceased(name: string): boolean {
    const authors = splitAuthors(name);
    return authors.length > 0 && authors.every((author) => DECEASED_AUTHORS.has(author));
  },
} as const;
