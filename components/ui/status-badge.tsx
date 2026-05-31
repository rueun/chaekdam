import { cn } from '@/lib/utils/cn';

/**
 * 책 상태 키 (책장).
 *
 * 도메인 `BookStatus` VO(ddd.md)는 대문자(`READING` 등)로 표현되며,
 * 표현 계층에서는 이 소문자 키로 매핑해 사용한다. 도메인 도입 시
 * Infrastructure/표현 경계에서 `READING → 'reading'` 매핑을 둔다.
 */
export type BookStatusKey = 'reading' | 'done' | 'wish' | 'paused';

/** 상태별 한국어 라벨 */
const STATUS_LABEL: Record<BookStatusKey, string> = {
  reading: '읽는 중',
  done: '완독',
  wish: '읽고 싶은',
  paused: '쉬는 중',
};

interface StatusBadgeProps {
  status: BookStatusKey;
  /** `sm` 은 BookCard·필터 행 등 좁은 영역용 */
  size?: 'md' | 'sm';
  /** `solid` 는 선택/활성 카드 강조용 (기본 soft) */
  variant?: 'soft' | 'solid';
  className?: string;
}

/**
 * 책 상태 배지.
 *
 * 네 상태가 서로 다른 색 계열로 읽히도록 설계됨(reading=포레스트 그린,
 * done=클레이+체크, wish=그레이블루, paused=하이라이트). 점·체크 의사요소와
 * 색은 디자인시스템 CSS(`globals.css`의 `.status-badge`)가 담당한다.
 */
export function StatusBadge({
  status,
  size = 'md',
  variant = 'soft',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        `is-${status}`,
        size === 'sm' && 'sm',
        variant === 'solid' && 'solid',
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
