'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/infrastructure/supabase/server-client';
import { loginSchema, signupSchema } from '@/lib/application/auth/schemas';
import { ROUTES } from '@/lib/router/routes';

export interface AuthFormState {
  /** 폼 전역 에러(자격 증명 오류 등) */
  error?: string;
  /** 필드별 검증 에러 */
  fieldErrors?: Record<string, string[] | undefined>;
}

/** 이메일/비밀번호 로그인. 성공 시 홈으로 리다이렉트. */
export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: '이메일 또는 비밀번호가 올바르지 않아요.' };

  revalidatePath('/', 'layout');
  redirect(ROUTES.DASHBOARD());
}

/** 이메일/비밀번호 회원가입. 로컬은 이메일 확인이 꺼져 있어 즉시 로그인된다. */
export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
    tos: formData.get('tos'),
    privacy: formData.get('privacy'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });
  if (error) {
    // 메시지 문자열 대신 구조화된 코드로 분기(SDK 메시지 변경에 견고)
    return {
      error:
        error.code === 'user_already_exists'
          ? '이미 가입된 이메일이에요.'
          : '가입 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(ROUTES.DASHBOARD());
}

/** 로그아웃 후 로그인 화면으로. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(ROUTES.AUTH.LOGIN());
}
