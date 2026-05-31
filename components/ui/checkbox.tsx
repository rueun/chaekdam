'use client';

import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 (없으면 체크박스만) */
  children?: ReactNode;
  /** 부분 선택 표시 (DOM 프로퍼티) */
  indeterminate?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/**
 * 라벨 포함 체크박스. `indeterminate` 는 속성이 아닌 DOM 프로퍼티라 ref 로 설정한다.
 * react-hook-form `register()`(콜백 ref)과 호환. 스타일은 디자인시스템 CSS(`.opt`/`.cbx`).
 */
export function Checkbox({
  children,
  indeterminate = false,
  className,
  ref,
  ...props
}: CheckboxProps) {
  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="opt">
      <input
        type="checkbox"
        className={cn('cbx', className)}
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
        }}
        {...props}
      />
      {children}
    </label>
  );
}
