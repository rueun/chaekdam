import { describe, it, expect } from 'vitest';
import { Book, BOOK_TITLE_MAX_LENGTH } from './book';
import { BookStatus } from './book-status';
import { EmptyBookTitleError, BookTitleTooLongError } from '@/lib/domain/shared/errors';

describe('Book', () => {
  describe('register', () => {
    it('책을 책장에 담는다 — 기본 상태는 WISH', () => {
      const book = Book.register({ ownerId: 'owner', title: '데미안', author: '헤르만 헤세' });
      expect(book.title).toBe('데미안');
      expect(book.author).toBe('헤르만 헤세');
      expect(book.status).toBe(BookStatus.WISH);
      expect(book.id).toBeTruthy();
    });

    it('상태와 표지 색을 지정해 담을 수 있다', () => {
      const book = Book.register({
        ownerId: 'owner',
        title: '데미안',
        status: BookStatus.READING,
        coverColor: 'var(--clay-500)',
      });
      expect(book.status).toBe(BookStatus.READING);
      expect(book.coverColor).toBe('var(--clay-500)');
    });

    it('제목 앞뒤 공백을 제거한다', () => {
      expect(Book.register({ ownerId: 'owner', title: '  데미안  ' }).title).toBe('데미안');
    });

    it('빈 제목으로는 담을 수 없다', () => {
      expect(() => Book.register({ ownerId: 'owner', title: '   ' })).toThrow(EmptyBookTitleError);
    });

    it('최대 길이를 초과하면 담을 수 없다', () => {
      const tooLong = 'ㄱ'.repeat(BOOK_TITLE_MAX_LENGTH + 1);
      expect(() => Book.register({ ownerId: 'owner', title: tooLong })).toThrow(
        BookTitleTooLongError,
      );
    });

    it('최대 길이와 같으면 담을 수 있다', () => {
      const exact = 'ㄱ'.repeat(BOOK_TITLE_MAX_LENGTH);
      expect(() => Book.register({ ownerId: 'owner', title: exact })).not.toThrow();
    });

    it('저자 미지정 시 빈 문자열', () => {
      expect(Book.register({ ownerId: 'owner', title: '데미안' }).author).toBe('');
    });

    it('책마다 고유 id를 가진다', () => {
      expect(Book.register({ ownerId: 'owner', title: '데미안' }).id).not.toBe(
        Book.register({ ownerId: 'owner', title: '데미안' }).id,
      );
    });
  });

  describe('restore', () => {
    const props = {
      id: 'book-1',
      ownerId: 'owner',
      title: '데미안',
      author: '헤르만 헤세',
      status: BookStatus.DONE,
      coverColor: 'var(--clay-500)',
      coverImageUrl: 'https://img/demian.jpg',
      createdAt: new Date('2026-05-20T00:00:00Z'),
    };

    it('저장된 상태를 그대로 복원한다', () => {
      const book = Book.restore(props);
      expect(book.id).toBe('book-1');
      expect(book.title).toBe('데미안');
      expect(book.status).toBe(BookStatus.DONE);
      expect(book.coverColor).toBe('var(--clay-500)');
      expect(book.coverImageUrl).toBe('https://img/demian.jpg');
      expect(book.createdAt).toBe(props.createdAt);
    });

    it('복원된 책도 동결되어 있다', () => {
      expect(Object.isFrozen(Book.restore(props))).toBe(true);
    });
  });

  describe('withStatus', () => {
    it('상태를 바꾼 새 책을 반환하고 원본은 그대로다', () => {
      const wish = Book.register({
        ownerId: 'owner',
        title: '데미안',
        author: '헤르만 헤세',
        status: BookStatus.WISH,
        coverColor: 'var(--clay-500)',
      });
      const reading = wish.withStatus(BookStatus.READING);

      expect(reading).not.toBe(wish);
      expect(reading.status).toBe(BookStatus.READING);
      expect(wish.status).toBe(BookStatus.WISH); // 원본 불변
      // 상태 외 식별·메타는 보존
      expect(reading.id).toBe(wish.id);
      expect(reading.title).toBe(wish.title);
      expect(reading.author).toBe(wish.author);
      expect(reading.coverColor).toBe(wish.coverColor);
      expect(reading.createdAt).toBe(wish.createdAt);
    });

    it('같은 상태로 바꾸면 동일 인스턴스를 반환한다', () => {
      const reading = Book.register({
        ownerId: 'owner',
        title: '데미안',
        status: BookStatus.READING,
      });
      expect(reading.withStatus(BookStatus.READING)).toBe(reading);
    });
  });

  describe('불변성', () => {
    it('생성된 책은 동결되어 필드를 바꿀 수 없다', () => {
      const book = Book.register({ ownerId: 'owner', title: '데미안' });
      expect(Object.isFrozen(book)).toBe(true);
      expect(() => {
        // @ts-expect-error 런타임 불변성 검증
        book.title = '변경';
      }).toThrow(TypeError);
    });
  });
});
