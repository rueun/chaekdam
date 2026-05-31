import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'new' | 'ai' | 'done';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  new: 'badge-new',
  ai: 'badge-ai',
  done: 'badge-done',
};

/**
 * 작은 상태 핍. 신규(new)·AI 귀속(ai)·완독(done) 의미별 색.
 * 스타일은 디자인시스템 CSS(`globals.css`의 `.badge`).
 */
export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn('badge', VARIANT_CLASS[variant], className)} {...props} />;
}
