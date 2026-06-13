import { describe, it, expect } from 'vitest';
import { toReadingDayKey, readingDayKeyOf, previousReadingDayKey } from './reading-day';

describe('reading-day', () => {
  describe('toReadingDayKey', () => {
    it('UTC 시각을 KST 캘린더 날짜로 환산한다', () => {
      // 2026-06-06T03:00:00Z = KST 2026-06-06 12:00
      expect(toReadingDayKey(new Date('2026-06-06T03:00:00Z'))).toBe('2026-06-06');
    });

    it('KST 자정 경계를 정확히 가른다(+9h)', () => {
      // UTC 15:00 = 다음날 KST 00:00
      expect(toReadingDayKey(new Date('2026-06-06T15:00:00Z'))).toBe('2026-06-07');
      // UTC 14:59 = 같은날 KST 23:59
      expect(toReadingDayKey(new Date('2026-06-06T14:59:00Z'))).toBe('2026-06-06');
    });
  });

  describe('readingDayKeyOf', () => {
    it('연/월/일을 2자리 0 패딩 키로 만든다', () => {
      expect(readingDayKeyOf(2026, 6, 7)).toBe('2026-06-07');
      expect(readingDayKeyOf(2026, 12, 25)).toBe('2026-12-25');
    });
  });

  describe('previousReadingDayKey', () => {
    it('하루 전 키를 만든다', () => {
      expect(previousReadingDayKey('2026-06-07')).toBe('2026-06-06');
    });

    it('월 경계를 넘는다', () => {
      expect(previousReadingDayKey('2026-06-01')).toBe('2026-05-31');
    });

    it('연 경계를 넘는다', () => {
      expect(previousReadingDayKey('2026-01-01')).toBe('2025-12-31');
    });
  });
});
