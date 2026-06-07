import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * 필수 동의 체크박스 — HTML 체크박스는 미체크 시 FormData 값이 없어(null) 들어온다.
 * preprocess 로 'on' 여부를 boolean 으로 정규화한 뒤 true 만 허용해, 미체크 시
 * zod 내부 영문 메시지 대신 한국어 메시지가 노출되도록 한다.
 */
const requiredAgreement = (message: string) =>
  z.preprocess((v) => v === 'on', z.literal(true, { errorMap: () => ({ message }) }));

export const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해 주세요').max(40),
    email: z.string().email('이메일 형식이 올바르지 않아요'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 해요'),
    confirm: z.string(),
    tos: requiredAgreement('이용 약관에 동의해 주세요'),
    privacy: requiredAgreement('개인정보 처리 방침에 동의해 주세요'),
  })
  .refine((v) => v.password === v.confirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['confirm'],
  });
export type SignupInput = z.infer<typeof signupSchema>;
