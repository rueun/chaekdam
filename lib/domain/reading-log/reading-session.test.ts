import { describe, it, expect } from 'vitest';
import { ReadingSession, READING_SESSION_MAX_MINUTES } from './reading-session';
import { InvalidSessionMinutesError, InvalidPageRangeError } from '@/lib/domain/shared/errors';

describe('ReadingSession', () => {
  describe('log', () => {
    it('세션을 기록한다(분 + 페이지 범위)', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: 24, startPage: 10, endPage: 42 });
      expect(s.bookId).toBe('b1');
      expect(s.minutes).toBe(24);
      expect(s.startPage).toBe(10);
      expect(s.endPage).toBe(42);
      expect(s.pageSpan).toBe(32);
      expect(s.id).toBeTruthy();
    });

    it('페이지 범위 없이도 기록할 수 있다', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: 10 });
      expect(s.startPage).toBeNull();
      expect(s.endPage).toBeNull();
      expect(s.pageSpan).toBeNull();
    });

    it('시작과 끝 페이지가 같으면 pageSpan 은 0 이다', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: 5, startPage: 20, endPage: 20 });
      expect(s.pageSpan).toBe(0);
    });

    it('occurredAt 미지정 시 현재 시각을 쓴다', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: 5 });
      expect(s.occurredAt).toBeInstanceOf(Date);
    });

    it('분이 0 이하면 거부한다', () => {
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: 0 })).toThrow(
        InvalidSessionMinutesError,
      );
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: -3 })).toThrow(
        InvalidSessionMinutesError,
      );
    });

    it('분이 소수면 거부한다(타이머는 분 단위 정수)', () => {
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: 5.5 })).toThrow(
        InvalidSessionMinutesError,
      );
    });

    it('분이 NaN/Infinity 면 거부한다', () => {
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: Number.NaN })).toThrow(
        InvalidSessionMinutesError,
      );
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: Number.POSITIVE_INFINITY })).toThrow(
        InvalidSessionMinutesError,
      );
    });

    it('분이 정확히 하루면 허용한다(경계)', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: READING_SESSION_MAX_MINUTES });
      expect(s.minutes).toBe(READING_SESSION_MAX_MINUTES);
    });

    it('분이 하루를 넘으면 거부한다', () => {
      expect(() =>
        ReadingSession.log({ bookId: 'b1', minutes: READING_SESSION_MAX_MINUTES + 1 }),
      ).toThrow(InvalidSessionMinutesError);
    });

    it('페이지가 한쪽만 주어지면 거부한다', () => {
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: 5, startPage: 10 })).toThrow(
        InvalidPageRangeError,
      );
      expect(() => ReadingSession.log({ bookId: 'b1', minutes: 5, endPage: 42 })).toThrow(
        InvalidPageRangeError,
      );
    });

    it('끝 페이지가 시작보다 작으면 거부한다', () => {
      expect(() =>
        ReadingSession.log({ bookId: 'b1', minutes: 5, startPage: 40, endPage: 10 }),
      ).toThrow(InvalidPageRangeError);
    });
  });

  describe('restore', () => {
    it('저장된 상태를 그대로 복원한다', () => {
      const occurredAt = new Date('2026-06-07T09:00:00Z');
      const createdAt = new Date('2026-06-07T09:05:00Z');
      const s = ReadingSession.restore({
        id: 'sess-1',
        bookId: 'b1',
        minutes: 24,
        startPage: 10,
        endPage: 42,
        occurredAt,
        createdAt,
      });
      expect(s.id).toBe('sess-1');
      expect(s.minutes).toBe(24);
      expect(s.pageSpan).toBe(32);
      expect(s.occurredAt).toBe(occurredAt);
      expect(s.createdAt).toBe(createdAt);
      expect(Object.isFrozen(s)).toBe(true);
    });

    it('페이지가 한쪽만 있는 손상된 상태는 복원을 거부한다', () => {
      expect(() =>
        ReadingSession.restore({
          id: 'sess-2',
          bookId: 'b1',
          minutes: 10,
          startPage: 10,
          endPage: null,
          occurredAt: new Date(),
          createdAt: new Date(),
        }),
      ).toThrow(InvalidPageRangeError);
    });

    it('페이지 범위 없는 세션도 복원한다(둘 다 null 은 정상)', () => {
      const s = ReadingSession.restore({
        id: 'sess-3',
        bookId: 'b1',
        minutes: 15,
        startPage: null,
        endPage: null,
        occurredAt: new Date('2026-06-07T09:00:00Z'),
        createdAt: new Date('2026-06-07T09:00:00Z'),
      });
      expect(s.pageSpan).toBeNull();
      expect(Object.isFrozen(s)).toBe(true);
    });
  });

  describe('불변성', () => {
    it('기록된 세션은 동결되어 있다', () => {
      const s = ReadingSession.log({ bookId: 'b1', minutes: 5 });
      expect(Object.isFrozen(s)).toBe(true);
      expect(() => {
        // @ts-expect-error 런타임 불변성 검증
        s.minutes = 99;
      }).toThrow(TypeError);
    });

    it('세션마다 고유 id', () => {
      const a = ReadingSession.log({ bookId: 'b1', minutes: 5 });
      const b = ReadingSession.log({ bookId: 'b1', minutes: 5 });
      expect(a.id).not.toBe(b.id);
    });
  });
});
