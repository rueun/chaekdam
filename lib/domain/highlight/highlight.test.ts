import { describe, it, expect } from 'vitest';
import { Highlight, HIGHLIGHT_CONTENT_MAX_LENGTH } from './highlight';
import { NoteSource } from './note-source';
import {
  EmptyBookIdError,
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

  describe('edit', () => {
    it('본문·페이지를 바꾼 새 한 줄을 반환하고 원본은 그대로다', () => {
      const original = Highlight.fromText('book-1', '원래 문장', '10');
      const edited = original.edit({ content: '고친 문장', page: '42' });

      expect(edited).not.toBe(original);
      expect(edited.content).toBe('고친 문장');
      expect(edited.page).toBe('42');
      expect(edited.id).toBe(original.id); // 식별자·출처 유지
      expect(edited.source).toBe(original.source);
      expect(original.content).toBe('원래 문장'); // 원본 불변
    });

    it('page 를 생략하면 기존 페이지를 유지한다', () => {
      const original = Highlight.fromText('book-1', '문장', '10');
      expect(original.edit({ content: '바뀐 문장' }).page).toBe('10');
    });

    it('page 를 null 로 주면 페이지를 지운다', () => {
      const original = Highlight.fromText('book-1', '문장', '10');
      expect(original.edit({ content: '바뀐 문장', page: null }).page).toBeNull();
    });

    it('빈 본문으로는 수정할 수 없다', () => {
      const original = Highlight.fromText('book-1', '문장');
      expect(() => original.edit({ content: '   ' })).toThrow(EmptyHighlightContentError);
    });
  });

  describe('moveTo', () => {
    it('다른 책으로 옮긴 새 한 줄을 반환하고 원본은 그대로다', () => {
      const original = Highlight.fromText('book-a', '문장');
      const moved = original.moveTo('book-b');

      expect(moved).not.toBe(original);
      expect(moved.bookId).toBe('book-b');
      expect(moved.id).toBe(original.id);
      expect(moved.content).toBe('문장');
      expect(original.bookId).toBe('book-a'); // 원본 불변
    });

    it('빈 책 식별자로는 옮길 수 없다', () => {
      const original = Highlight.fromText('book-a', '문장');
      expect(() => original.moveTo('  ')).toThrow(EmptyBookIdError);
    });
  });

  describe('pin · archive', () => {
    it('기본 상태는 고정·보관 모두 false 다', () => {
      const highlight = Highlight.fromText('b1', '문장');
      expect(highlight.pinned).toBe(false);
      expect(highlight.archived).toBe(false);
    });

    it('pin/unpin 은 원본을 보존한 새 한 줄을 반환한다', () => {
      const original = Highlight.fromText('b1', '문장');
      const pinned = original.pin();
      expect(pinned).not.toBe(original);
      expect(pinned.pinned).toBe(true);
      expect(original.pinned).toBe(false); // 원본 불변
      expect(pinned.unpin().pinned).toBe(false);
    });

    it('archive 는 보관하면서 고정을 함께 해제한다(불변식)', () => {
      const pinned = Highlight.fromText('b1', '문장').pin();
      const archived = pinned.archive();
      expect(archived.archived).toBe(true);
      expect(archived.pinned).toBe(false); // 보관 시 고정 해제
      expect(pinned.archived).toBe(false); // 원본 불변
    });

    it('unarchive 는 보관을 해제한다', () => {
      const archived = Highlight.fromText('b1', '문장').archive();
      expect(archived.unarchive().archived).toBe(false);
    });
  });

  describe('tags', () => {
    it('기본 태그는 빈 배열이다', () => {
      expect(Highlight.fromText('b1', '문장').tags).toEqual([]);
    });

    it('태그를 정규화한다 — 공백 제거·빈 제거·대소문자 무시 중복 제거', () => {
      const h = Highlight.fromText('b1', '문장', null, [' 위로 ', '위로', '', '성장']);
      expect(h.tags).toEqual(['위로', '성장']);
    });

    it('태그 개수를 상한(10)으로 제한한다', () => {
      const many = Array.from({ length: 15 }, (_, i) => `태그${i}`);
      expect(Highlight.fromText('b1', '문장', null, many).tags).toHaveLength(10);
    });

    it('30자를 넘는 태그는 버린다', () => {
      const tooLong = 'ㄱ'.repeat(31);
      expect(Highlight.fromText('b1', '문장', null, [tooLong, '짧은']).tags).toEqual(['짧은']);
    });

    it('모두 공백/빈 문자열이면 빈 배열이다', () => {
      expect(Highlight.fromText('b1', '문장', null, ['', '   ']).tags).toEqual([]);
    });

    it('edit 으로 태그를 교체한다(undefined 면 유지)', () => {
      const h = Highlight.fromText('b1', '문장', null, ['위로']);
      expect(h.edit({ content: '문장', tags: ['성장'] }).tags).toEqual(['성장']);
      expect(h.edit({ content: '문장' }).tags).toEqual(['위로']); // 유지
    });

    it('태그 배열은 동결되어 변경할 수 없다', () => {
      const h = Highlight.fromText('b1', '문장', null, ['위로']);
      expect(Object.isFrozen(h.tags)).toBe(true);
    });
  });
});
