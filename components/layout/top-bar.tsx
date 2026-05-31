import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Icon, type IconName } from '@/components/ui/icon';
import { SearchInput } from '@/components/ui/search-input';

interface TopBarAction {
  label: string;
  href: string;
  icon?: IconName;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  /** 우측 기본 액션(CTA) */
  action?: TopBarAction;
  /** 검색창 노출 여부 (기본 true) */
  showSearch?: boolean;
}

/**
 * 페이지 상단 바 — 제목/부제 + 검색 + 기본 액션. 페이지마다 제목이 달라 페이지가 직접 렌더한다.
 * 스타일은 디자인시스템 CSS(`.top`).
 */
export function TopBar({ title, subtitle, action, showSearch = true }: TopBarProps) {
  return (
    <div className="top">
      <div>
        <h1>
          {title}
          {subtitle ? <small>{subtitle}</small> : null}
        </h1>
      </div>
      <div className="top-actions">
        {showSearch ? (
          <SearchInput
            placeholder="책, 작가, 밑줄 검색"
            containerClassName="w-72"
            aria-label="검색"
          />
        ) : null}
        {action ? (
          <Link href={action.href} className={cn('btn', 'btn-primary')}>
            <Icon name={action.icon ?? 'pen-line'} size={16} />
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
