import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** default=흰 배경 · soft=옅은 그린 */
  variant?: 'default' | 'soft';
  size?: 'md' | 'sm';
  /** 선택(토글) 상태 — 지정 시 채워진 그린 + aria-pressed */
  active?: boolean;
}

/**
 * 필터/선택 라운드 필 버튼. 인터랙티브하므로 `<button>` 으로 렌더.
 * `active` 가 주어지면 토글 시맨틱(`aria-pressed`)을 부여한다.
 * 스타일은 디자인시스템 CSS(`globals.css`의 `.chip`).
 */
export function Chip({
  variant = 'default',
  size = 'md',
  active,
  type = 'button',
  className,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'chip',
        variant === 'soft' && 'chip-soft',
        size === 'sm' && 'chip-sm',
        active && 'is-active',
        className,
      )}
      {...props}
    />
  );
}
