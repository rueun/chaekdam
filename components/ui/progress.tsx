import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  /** 진행률 0–100 (범위를 벗어나면 클램프) */
  value: number;
  className?: string;
  label?: string;
}

/**
 * 가는 진행 바. 읽기 진척도 등에 사용.
 * 스타일은 디자인시스템 CSS(`globals.css`의 `.progress`).
 */
export function Progress({ value, className, label }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('progress', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? '진행률'}
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}
