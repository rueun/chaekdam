import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type TagProps = HTMLAttributes<HTMLSpanElement>;

/**
 * 콘텐츠 인라인 태그(예: #소설). 비인터랙티브.
 * 스타일은 디자인시스템 CSS(`globals.css`의 `.tag-chip`).
 */
export function Tag({ className, ...props }: TagProps) {
  return <span className={cn('tag-chip', className)} {...props} />;
}
