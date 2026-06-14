'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/router/routes';
import { Icon, type IconName } from '@/components/ui/icon';
import { openProfileEdit } from '@/components/feature/profile/profile-edit-modal';
import type { CurrentUserView } from '@/components/feature/profile/user-view';

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

interface SidebarProps {
  /** 현재 사용자(프로필). 비로그인/조회 실패 시 null. */
  user: CurrentUserView | null;
  /** 오늘 읽은 분(프로필 카드 서브텍스트) */
  minutesToday: number;
}

/** 대시보드 좌측 내비게이션. 현재 경로로 활성 항목을 판정한다. */
export function Sidebar({ user, minutesToday }: SidebarProps) {
  const pathname = usePathname();
  // 정확 일치 + 하위 경로(예: /discussions/abc)도 해당 내비를 활성으로 본다
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const subtext = minutesToday > 0 ? `오늘 ${minutesToday}분 읽음` : '오늘 첫 페이지를 펼쳐보세요';

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

      {user ? (
        <button
          type="button"
          onClick={() => openProfileEdit({ name: user.name, bio: user.bio, initial: user.initial })}
          aria-label="프로필 수정"
          className="hover:bg-paper-200 mt-auto flex w-full items-center gap-[10px] rounded-[10px] p-[8px_10px] text-left"
          title="프로필 수정"
        >
          <span className="bg-leaf-100 text-leaf-700 flex size-8 items-center justify-center rounded-full text-[12px] font-bold">
            {user.initial}
          </span>
          <span className="flex-1 truncate">
            <span className="text-ink-900 block truncate text-[13px] font-semibold">
              {user.name}
            </span>
            <span className="text-fg-3 block text-[11px]">{subtext}</span>
          </span>
        </button>
      ) : null}
    </aside>
  );
}
