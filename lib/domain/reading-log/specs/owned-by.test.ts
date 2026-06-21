import { describe, it, expect } from 'vitest';
import { OwnedBy } from './owned-by';
import { ReadingSession } from '@/lib/domain/reading-log/reading-session';

describe('OwnedBy (ReadingSession)', () => {
  it('소유자 본인이면 만족한다', () => {
    const session = ReadingSession.log({ ownerId: 'owner', bookId: 'b1', minutes: 10 });
    expect(new OwnedBy('owner').isSatisfiedBy(session)).toBe(true);
  });

  it('소유자가 아니면 만족하지 않는다', () => {
    const session = ReadingSession.log({ ownerId: 'owner', bookId: 'b1', minutes: 10 });
    expect(new OwnedBy('intruder').isSatisfiedBy(session)).toBe(false);
  });
});
