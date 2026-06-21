/**
 * 한 줄 표현 뷰모델(도메인 Highlight → UI).
 * 서버(액션 반환·페이지 매핑)와 클라이언트 컴포넌트가 공유하는 표현 계약이므로
 * React 컴포넌트(.tsx)가 아닌 순수 모듈에 둔다(서버 코드가 UI 컴포넌트를 끌어오지 않게).
 */
export interface HighlightView {
  id: string;
  /** 구절 본문 (도메인 Highlight.content) */
  content: string;
  /** content 안에서 강조할 부분(첫 일치만) */
  emphasis?: string;
  /** 저자 (책 메타가 있을 때만 — books 테이블 도입 전 DB 한 줄엔 없음) */
  author?: string;
  /** 책 제목 (위와 동일) */
  book?: string;
  /** 페이지 표기 (예: 'p.42') */
  page?: string;
  /** 책 메타가 없을 때 보조 메타로 쓰는 날짜 라벨(예: '6월 7일') */
  dateLabel?: string;
  /** 사진 출처(PHOTO)면 원본 사진 URL — 썸네일로 표시(ADR-020) */
  photoUrl?: string;
  /** 고정 여부 — 핀 배지 + 메뉴 라벨(ADR-021) */
  pinned?: boolean;
  /** 보관 여부 — 메뉴 라벨(ADR-021) */
  archived?: boolean;
  /** 자유 입력 태그(ADR-023) — 칩으로 표시·필터 링크 */
  tags?: string[];
}
