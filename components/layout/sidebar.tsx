'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/router/routes';
import { Icon, type IconName } from '@/components/ui/icon';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const NAV: NavItem[] = [
  { href: ROUTES.DASHBOARD(), label: '홈', icon: 'home' },
  { href: ROUTES.LIBRARY(), label: '내 서재', icon: 'library' },
  { href: ROUTES.WISHLIST(), label: '읽고 싶은', icon: 'bookmark' },
  { href: ROUTES.READING(), label: '읽는 중', icon: 'book-open' },
  { href: ROUTES.HIGHLIGHTS(), label: '밑줄 모음', icon: 'quote' },
  { href: ROUTES.DISCUSSIONS.LIST(), label: 'AI 독서토론', icon: 'messages-square' },
];

const RECORD_NAV: NavItem[] = [
  { href: ROUTES.STATS(), label: '독서 기록', icon: 'chart-line' },
  { href: ROUTES.SETTINGS(), label: '설정', icon: 'settings' },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn('nav-item', active && 'active')}
      aria-current={active ? 'page' : undefined}
    >
      <Icon name={item.icon} size={18} />
      <span>{item.label}</span>
    </Link>
  );
}

/** 대시보드 좌측 내비게이션. 현재 경로로 활성 항목을 판정한다. */
export function Sidebar() {
  const pathname = usePathname();
  // 정확 일치 + 하위 경로(예: /discussions/abc)도 해당 내비를 활성으로 본다
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="wm">책담</div>
        <div className="tag">Chaekdam</div>
      </div>

      <nav className="nav" aria-label="주 내비게이션">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="nav-section">기록</div>
        {RECORD_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <Link
        href={ROUTES.SETTINGS()}
        className="mt-auto flex w-full items-center gap-[10px] rounded-[10px] p-[8px_10px] text-left hover:bg-[var(--paper-200)]"
        title="프로필"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--terra-100)] text-[12px] font-bold text-[var(--terra-700)]">
          홍
        </span>
        <span className="flex-1">
          <span className="block text-[13px] font-semibold text-[var(--ink-900)]">홍길동</span>
          <span className="block text-[11px] text-[var(--fg-3)]">오늘 24분 읽음</span>
        </span>
      </Link>
    </aside>
  );
}
