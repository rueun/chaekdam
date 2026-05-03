import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind 클래스 결합·중복 제거 유틸.
 * 사용: cn('px-4', condition && 'bg-red-500', { 'opacity-50': isDisabled })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
