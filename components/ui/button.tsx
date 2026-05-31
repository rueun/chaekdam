import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 아이콘 하나만 들어가는 정사각 버튼 */
  iconOnly?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

/**
 * 기본 액션 버튼.
 *
 * 색은 variant, 크기는 size 로 분리(디자인 원본의 `btn-danger`가 색+크기를
 * 함께 묶던 것을 정규화). 스타일은 디자인시스템 CSS(`globals.css`의 `.btn`).
 * `type` 은 폼 오작동 방지를 위해 기본 `button`.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  type = 'button',
  className,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'btn',
        VARIANT_CLASS[variant],
        size === 'sm' && 'btn-sm',
        iconOnly && 'btn-icon',
        className,
      )}
      {...props}
    />
  );
}
