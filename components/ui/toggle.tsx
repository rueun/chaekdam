import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils/cn';

// 네이티브 input 의 size(number)와 충돌하므로 Omit 후 우리 size 를 정의
interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** lg 는 iOS 스타일 모바일 화면용 */
  size?: 'md' | 'lg';
  ref?: Ref<HTMLInputElement>;
}

/**
 * 토글 스위치. 접근성을 위해 `role="switch"` 를 부여한다(라벨/aria-label 은 호출자가 제공).
 * 스타일은 디자인시스템 CSS(`.toggle`).
 */
export function Toggle({ size = 'md', className, ref, ...props }: ToggleProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn('toggle', size === 'lg' && 'toggle-lg', className)}
      ref={ref}
      {...props}
    />
  );
}
