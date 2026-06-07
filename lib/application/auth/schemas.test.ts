import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from './schemas';

describe('loginSchema', () => {
  it('올바른 이메일/비밀번호를 통과시킨다', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('이메일 형식이 틀리면 거부한다', () => {
    const r = loginSchema.safeParse({ email: 'nope', password: 'x' });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.flatten().fieldErrors.email?.[0]).toBe('이메일 형식이 올바르지 않아요');
  });
});

describe('signupSchema', () => {
  const valid = {
    name: '길동',
    email: 'a@b.com',
    password: 'password123',
    confirm: 'password123',
    tos: 'on',
    privacy: 'on',
  };

  it('필수 입력과 동의가 모두 있으면 통과한다', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('약관 미동의(체크박스 null)는 한국어 메시지로 거부한다', () => {
    const r = signupSchema.safeParse({ ...valid, tos: null });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.flatten().fieldErrors.tos?.[0]).toBe('이용 약관에 동의해 주세요');
  });

  it('비밀번호가 일치하지 않으면 confirm 에러를 낸다', () => {
    const r = signupSchema.safeParse({ ...valid, confirm: 'different' });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.flatten().fieldErrors.confirm?.[0]).toBe('비밀번호가 일치하지 않아요');
  });

  it('비밀번호가 8자 미만이면 거부한다', () => {
    const r = signupSchema.safeParse({ ...valid, password: 'short', confirm: 'short' });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.flatten().fieldErrors.password?.[0]).toBe('비밀번호는 8자 이상이어야 해요');
  });
});
