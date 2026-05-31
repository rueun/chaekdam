import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 검증 실패 상태 — 빨강 테두리 + aria-invalid */
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/**
 * 텍스트 입력. react-hook-form `register()` 스프레드(ref 포함)와 호환되도록
 * ref 를 prop 으로 받는다(React 19). 스타일은 디자인시스템 CSS(`.input`).
 */
export function Input({ error, className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={error ? true : undefined}
      className={cn('input', error && 'is-error', className)}
      {...props}
    />
  );
}
