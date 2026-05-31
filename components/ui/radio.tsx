import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils/cn';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 */
  children?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/**
 * 라벨 포함 라디오. 같은 `name` 으로 그룹화한다.
 * 스타일은 디자인시스템 CSS(`.opt`/`.rdo`).
 */
export function Radio({ children, className, ref, ...props }: RadioProps) {
  return (
    <label className="opt">
      <input type="radio" className={cn('rdo', className)} ref={ref} {...props} />
      {children}
    </label>
  );
}
