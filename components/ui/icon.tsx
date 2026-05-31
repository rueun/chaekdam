import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * 사용하는 lucide 아이콘만 등록한다(트리셰이킹). 필요할 때 여기에 추가.
 * 목업의 `<Icon name="..." />` API 와 동일한 사용감.
 */
const ICON_MAP = {
  x: X,
  'more-horizontal': MoreHorizontal,
  search: Search,
  check: Check,
  plus: Plus,
  settings: Settings,
  'chevron-down': ChevronDown,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  /** 정사각 크기(px) */
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** 지정 시 의미 있는 아이콘(role=img), 미지정 시 장식(aria-hidden) */
  'aria-label'?: string;
}

/**
 * 아이콘 — 색은 `currentColor`(부모 텍스트 색 상속), 기본 크기 18px.
 * 라벨이 없으면 장식으로 간주해 스크린리더에서 숨긴다.
 */
export function Icon({
  name,
  size = 18,
  strokeWidth,
  className,
  'aria-label': ariaLabel,
}: IconProps) {
  const LucideComponent = ICON_MAP[name];
  return (
    <LucideComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    />
  );
}
