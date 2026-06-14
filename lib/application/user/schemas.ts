import { z } from 'zod';

/**
 * 프로필 수정 입력 — 클라이언트 검증 + Server Action 검증 단일 소스.
 * bio 는 빈 문자열을 null 로 정규화해 UpdateUserProfileCommand(bio: string | null)와 타입을 맞춘다.
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해 주세요')
    .max(40, '이름은 40자 이하로 입력해 주세요'),
  bio: z
    .string()
    .trim()
    .max(80, '소개는 80자 이하로 입력해 주세요')
    .transform((v) => (v.length > 0 ? v : null)),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
