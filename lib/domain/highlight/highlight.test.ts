import { describe, it, expect } from 'vitest';
import { Highlight, HIGHLIGHT_CONTENT_MAX_LENGTH } from './highlight';
import { NoteSource } from './note-source';
import {
  EmptyHighlightContentError,
  HighlightContentTooLongError,
  MissingPhotoUrlError,
} from '@/lib/domain/shared/errors';

describe('Highlight', () => {
  describe('fromText', () => {
    it('텍스트 구절로부터 TEXT 출처의 한 줄을 만든다', () => {
      const highlight = Highlight.fromText('book-1', '인상 깊은 한 구절');

      expect(highlight.source).toBe(NoteSource.TEXT);
      expect(highlight.content).toBe('인상 깊은 한 구절');
      expect(highlight.photoUrl).toBeNull();
      expect(highlight.bookId).toBe('book-1');
      expect(highlight.isFromPhoto()).toBe(false);
    });

    it('본문 앞뒤 공백을 제거한다', () => {
      const highlight = Highlight.fromText('book-1', '  여백이 있는 문장  ');
      expect(highlight.content).toBe('여백이 있는 문장');
    });

    it('빈 본문으로는 만들 수 없다', () => {
      expect(() => Highlight.fromText('book-1', '')).toThrow(EmptyHighlightContentError);
    });

    it('공백뿐인 본문으로는 만들 수 없다', () => {
      expect(() => Highlight.fromText('book-1', '   ')).toThrow(EmptyHighlightContentError);
    });

    it('최대 길이를 초과하면 만들 수 없다', () => {
      const tooLong = 'ㄱ'.repeat(HIGHLIGHT_CONTENT_MAX_LENGTH + 1);
      expect(() => Highlight.fromText('book-1', tooLong)).toThrow(HighlightContentTooLongError);
    });

    it('최대 길이와 같으면 만들 수 있다', () => {
      const exact = 'ㄱ'.repeat(HIGHLIGHT_CONTENT_MAX_LENGTH);
      expect(() => Highlight.fromText('book-1', exact)).not.toThrow();
    });

    it('페이지를 함께 기록할 수 있다', () => {
      const highlight = Highlight.fromText('book-1', '문장', 'p.42');
      expect(highlight.page).toBe('p.42');
    });
  });

  describe('fromPhoto', () => {
    it('사진에서 추출한 구절로 PHOTO 출처의 한 줄을 만든다', () => {
      const highlight = Highlight.fromPhoto('book-1', 'https://x/y.jpg', '추출된 문장');

      expect(highlight.source).toBe(NoteSource.PHOTO);
      expect(highlight.photoUrl).toBe('https://x/y.jpg');
      expect(highlight.content).toBe('추출된 문장');
      expect(highlight.isFromPhoto()).toBe(true);
    });

    it('사진 URL이 없으면 만들 수 없다', () => {
      expect(() => Highlight.fromPhoto('book-1', '', '문장')).toThrow(MissingPhotoUrlError);
    });

    it('공백뿐인 사진 URL로는 만들 수 없다', () => {
      expect(() => Highlight.fromPhoto('book-1', '   ', '문장')).toThrow(MissingPhotoUrlError);
    });

    it('사진 URL 앞뒤 공백을 제거해 저장한다', () => {
      const highlight = Highlight.fromPhoto('book-1', '  https://x/y.jpg  ', '문장');
      expect(highlight.photoUrl).toBe('https://x/y.jpg');
    });

    it('추출 본문이 비어 있으면 만들 수 없다', () => {
      expect(() => Highlight.fromPhoto('book-1', 'https://x/y.jpg', '  ')).toThrow(
        EmptyHighlightContentError,
      );
    });
  });

  describe('restore', () => {
    it('저장된 상태를 그대로 복원한다', () => {
      const createdAt = new Date('2026-05-31T00:00:00Z');
      const highlight = Highlight.restore({
        id: 'h-1',
        bookId: 'book-1',
        source: NoteSource.PHOTO,
        content: '복원된 문장',
        photoUrl: 'https://x/y.jpg',
        page: 'p.10',
        createdAt,
      });

      expect(highlight.id).toBe('h-1');
      expect(highlight.content).toBe('복원된 문장');
      expect(highlight.createdAt).toBe(createdAt);
    });

    it('복원된 한 줄도 동결되어 있다', () => {
      const highlight = Highlight.restore({
        id: 'h-1',
        bookId: 'book-1',
        source: NoteSource.TEXT,
        content: '문장',
        photoUrl: null,
        page: null,
        createdAt: new Date(),
      });
      expect(Object.isFrozen(highlight)).toBe(true);
    });

    it('사진 출처인데 사진 URL이 없는 부패 데이터는 복원을 거부한다', () => {
      expect(() =>
        Highlight.restore({
          id: 'h-1',
          bookId: 'book-1',
          source: NoteSource.PHOTO,
          content: '문장',
          photoUrl: null,
          page: null,
          createdAt: new Date(),
        }),
      ).toThrow(MissingPhotoUrlError);
    });
  });

  describe('불변성', () => {
    it('생성된 한 줄은 동결되어 필드를 바꿀 수 없다', () => {
      const highlight = Highlight.fromText('book-1', '문장');
      expect(Object.isFrozen(highlight)).toBe(true);
      expect(() => {
        // @ts-expect-error 런타임 불변성 검증 — readonly 필드 변경 시도
        highlight.content = '변경';
      }).toThrow(TypeError);
    });

    it('생성된 한 줄마다 고유 id를 가진다', () => {
      const a = Highlight.fromText('book-1', '문장');
      const b = Highlight.fromText('book-1', '문장');
      expect(a.id).not.toBe(b.id);
    });
  });
});
