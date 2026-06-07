'use client';

import { useActionState, type ReactNode } from 'react';
import Link from 'next/link';
import { signUp, type AuthFormState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/router/routes';
import { AuthField } from './auth-field';
import { OAuthButtons } from './oauth-buttons';
import { AuthDivider } from './auth-shell';

const INITIAL: AuthFormState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, INITIAL);

  return (
    <>
      <OAuthButtons mode="signup" />
      <AuthDivider />

      <form action={action} className="flex flex-col gap-4">
        <AuthField
          label="이름"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="책담에서 부를 이름"
          error={state.fieldErrors?.name?.[0]}
        />
        <AuthField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="reader@chaekdam.kr"
          error={state.fieldErrors?.email?.[0]}
        />
        <div className="grid grid-cols-2 gap-3 max-[400px]:grid-cols-1">
          <AuthField
            label="비밀번호"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상"
            error={state.fieldErrors?.password?.[0]}
          />
          <AuthField
            label="비밀번호 확인"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="다시 한 번"
            error={state.fieldErrors?.confirm?.[0]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Agreement name="tos" required error={state.fieldErrors?.tos?.[0]}>
            <b className="text-ink-900 font-semibold">(필수)</b> 이용 약관에 동의합니다
          </Agreement>
          <Agreement name="privacy" required error={state.fieldErrors?.privacy?.[0]}>
            <b className="text-ink-900 font-semibold">(필수)</b> 개인정보 처리 방침에 동의합니다
          </Agreement>
          <Agreement name="marketing">(선택) 새 소식·업데이트 메일을 받겠습니다</Agreement>
        </div>

        {state.error ? <p className="text-danger text-[13px]">{state.error}</p> : null}

        <Button type="submit" disabled={pending} className="w-full justify-center">
          {pending ? '가입 중…' : '회원가입'}
        </Button>
      </form>

      <p className="text-fg-2 mt-5 text-center text-[13px]">
        이미 책담 계정이 있으세요?{' '}
        <Link href={ROUTES.AUTH.LOGIN()} className="text-accent font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}

function Agreement({
  name,
  required,
  error,
  children,
}: {
  name: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-fg-2 flex items-start gap-2 text-[13px] leading-[1.5]">
        <input type="checkbox" name={name} className="cbx mt-0.5" aria-required={required} />
        <span>{children}</span>
      </label>
      {error ? <span className="text-danger ml-6 text-[12px]">{error}</span> : null}
    </div>
  );
}
