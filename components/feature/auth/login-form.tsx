'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn, type AuthFormState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/router/routes';
import { AuthField } from './auth-field';
import { OAuthButtons } from './oauth-buttons';
import { AuthDivider } from './auth-shell';

const INITIAL: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <>
      <OAuthButtons mode="login" />
      <AuthDivider />

      <form action={action} className="flex flex-col gap-4">
        <AuthField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="reader@chaekdam.kr"
          error={state.fieldErrors?.email?.[0]}
        />
        <AuthField
          label="비밀번호"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.fieldErrors?.password?.[0]}
        />

        {state.error ? <p className="text-danger text-[13px]">{state.error}</p> : null}

        <Button type="submit" disabled={pending} className="w-full justify-center">
          {pending ? '로그인 중…' : '로그인'}
        </Button>
      </form>

      <p className="text-fg-2 mt-5 text-center text-[13px]">
        아직 책담 계정이 없으세요?{' '}
        <Link href={ROUTES.AUTH.SIGNUP()} className="text-accent font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
