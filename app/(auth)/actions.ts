'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/infrastructure/supabase/server-client';
import { loginSchema, signupSchema } from '@/lib/application/auth/schemas';
import { siteUrl } from '@/lib/app-url';
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

/**
 * Google 로그인 시작 — Supabase OAuth(PKCE) URL 을 반환한다(리다이렉트는 클라이언트가 결정).
 * 클라이언트는 이 URL 을 팝업으로 열고(차단 시 현재 탭), Google 인증 후 Supabase 가
 * {siteUrl}/auth/callback 으로 code 와 함께 돌려보낸다. redirectTo 는 설정값으로 고정(allowlist 제한).
 * PKCE code-verifier 쿠키는 이 호출에서 설정돼(같은 도메인) 콜백이 읽는다.
 */
export async function signInWithGoogle(): Promise<{ url: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl()}${ROUTES.AUTH.CALLBACK()}` },
  });
  if (error || !data.url) {
    return { error: '구글 로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.' };
  }
  return { url: data.url };
}
