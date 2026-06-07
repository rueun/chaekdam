import { BookStatus } from '@/lib/domain/book/book-status';
import type { BookStatusKey } from '@/components/ui/status-badge';

/**
 * 도메인 BookStatus(대문자) ↔ 표현 BookStatusKey(소문자) 매핑.
 * 표현 ↔ 도메인 경계에서만 변환한다(도메인은 대문자, UI는 소문자 키 사용).
 */
const KEY_BY_STATUS: Record<BookStatus, BookStatusKey> = {
  [BookStatus.READING]: 'reading',
  [BookStatus.DONE]: 'done',
  [BookStatus.WISH]: 'wish',
  [BookStatus.PAUSED]: 'paused',
};

const STATUS_BY_KEY: Record<BookStatusKey, BookStatus> = {
  reading: BookStatus.READING,
  done: BookStatus.DONE,
  wish: BookStatus.WISH,
  paused: BookStatus.PAUSED,
};

export function toBookStatusKey(status: BookStatus): BookStatusKey {
  return KEY_BY_STATUS[status];
}

export function toDomainBookStatus(key: BookStatusKey): BookStatus {
  return STATUS_BY_KEY[key];
}
