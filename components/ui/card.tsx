import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** plain=크림 채움(기본) · elevated=흰 표면 + 그림자 */
  variant?: 'plain' | 'elevated';
}

/**
 * 표면 컨테이너 프리미티브.
 *
 * 디자인시스템에 제네릭 카드 클래스가 없어 design-system.md 규칙으로 합성:
 * "그림자 또는 크림 채움 — 둘 다 쓰지 않는다." plain 은 채움만, elevated 는 그림자만.
 */
export function Card({ variant = 'plain', className, ...props }: CardProps) {
  return (
    <div className={cn('card', variant === 'elevated' && 'card-elevated', className)} {...props} />
  );
}
