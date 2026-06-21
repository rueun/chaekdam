import { describe, it, expect } from 'vitest';
import { OwnedBy } from './owned-by';
import { Discussion } from '@/lib/domain/discussion/discussion';

describe('OwnedBy (Discussion)', () => {
  it('소유자 본인이면 만족한다', () => {
    const room = Discussion.start({ ownerId: 'owner', bookId: 'b1', personaKey: 'socrates' });
    expect(new OwnedBy('owner').isSatisfiedBy(room)).toBe(true);
  });

  it('소유자가 아니면 만족하지 않는다', () => {
    const room = Discussion.start({ ownerId: 'owner', bookId: 'b1', personaKey: 'socrates' });
    expect(new OwnedBy('intruder').isSatisfiedBy(room)).toBe(false);
  });
});
