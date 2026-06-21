import { describe, it, expect } from 'vitest';
import { OwnedBy } from './owned-by';
import { Book } from '@/lib/domain/book/book';

describe('OwnedBy (Book)', () => {
  it('소유자 본인이면 만족한다', () => {
    const book = Book.register({ ownerId: 'owner', title: '데미안' });
    expect(new OwnedBy('owner').isSatisfiedBy(book)).toBe(true);
  });

  it('소유자가 아니면 만족하지 않는다', () => {
    const book = Book.register({ ownerId: 'owner', title: '데미안' });
    expect(new OwnedBy('intruder').isSatisfiedBy(book)).toBe(false);
  });
});
