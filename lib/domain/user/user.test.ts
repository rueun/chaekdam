import { describe, it, expect } from 'vitest';
import { User } from './user';

describe('User', () => {
  it('저장된 상태로 복원한다', () => {
    const user = User.restore({ id: 'u1', name: '김독서', email: 'a@b.kr', bio: '종이책 애호가' });
    expect(user.id).toBe('u1');
    expect(user.name).toBe('김독서');
    expect(user.email).toBe('a@b.kr');
    expect(user.bio).toBe('종이책 애호가');
  });

  it('이름 첫 글자를 이니셜로 노출한다', () => {
    expect(User.restore({ id: 'u1', name: '홍길동', email: 'a@b.kr', bio: null }).initial).toBe(
      '홍',
    );
  });

  it('이름이 비면 이니셜은 ?', () => {
    expect(User.restore({ id: 'u1', name: '   ', email: 'a@b.kr', bio: null }).initial).toBe('?');
  });

  it('복원된 사용자는 동결되어 있다', () => {
    const user = User.restore({ id: 'u1', name: '홍길동', email: 'a@b.kr', bio: null });
    expect(Object.isFrozen(user)).toBe(true);
    expect(() => {
      // @ts-expect-error 런타임 불변성 검증
      user.name = '변경';
    }).toThrow(TypeError);
  });
});
