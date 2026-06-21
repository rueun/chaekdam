import { describe, it, expect } from 'vitest';
import { OwnedBy } from './owned-by';
import { Highlight } from '@/lib/domain/highlight/highlight';

describe('OwnedBy', () => {
  it('소유자 본인이면 만족한다', () => {
    const highlight = Highlight.fromText('owner', 'b1', '문장');
    expect(new OwnedBy('owner').isSatisfiedBy(highlight)).toBe(true);
  });

  it('소유자가 아니면 만족하지 않는다', () => {
    const highlight = Highlight.fromText('owner', 'b1', '문장');
    expect(new OwnedBy('intruder').isSatisfiedBy(highlight)).toBe(false);
  });
});
