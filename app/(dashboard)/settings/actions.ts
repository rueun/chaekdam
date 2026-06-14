'use server';

import { revalidatePath } from 'next/cache';
import {
  createAuthSession,
  createUpdateUserProfileUseCase,
} from '@/lib/infrastructure/di-container';
import { updateProfileSchema } from '@/lib/application/user/schemas';

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** 프로필(이름·한 줄 소개) 수정. 성공 시 레이아웃을 무효화해 사이드바·설정에 반영. */
export async function updateProfile(input: {
  name: string;
  bio: string;
}): Promise<UpdateProfileResult> {
  // 게이트는 redirect/UX 용. 소유 범위는 어댑터가 보장한다 — auth.updateUser 는 현재 세션
  // 사용자에게만 적용되므로(다른 사용자 수정 불가) userId 를 명령에 싣지 않는다(다른 Server Action 과 동일 패턴, ADR-004).
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return { ok: false, error: '로그인이 필요해요.' };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const useCase = await createUpdateUserProfileUseCase();
    await useCase.execute(parsed.data); // bio 는 스키마에서 빈값→null 정규화됨
  } catch (error) {
    console.error('Failed to update profile', error);
    return { ok: false, error: '프로필 저장에 실패했어요.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
