'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** 필드 검증 에러 메시지 */
  error?: string;
}

/** 인증 폼 필드 — 라벨 + 입력 + 에러 메시지(스크린리더 연결). */
export function AuthField({ label, error, id, ...props }: AuthFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-fg-3 text-[12px] font-semibold">
        {label}
      </label>
      <Input
        id={fieldId}
        error={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-danger text-[12px]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
