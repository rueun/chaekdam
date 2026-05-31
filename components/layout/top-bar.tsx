import type { ReactNode } from 'react';
import { SearchInput } from '@/components/ui/search-input';

interface TopBarProps {
  title: string;
  subtitle?: string;
  /** 우측 기본 액션(CTA) 슬롯 — Link 또는 모달 트리거 등 */
  action?: ReactNode;
  /** 검색창 노출 여부 (기본 true) */
  showSearch?: boolean;
}

/**
 * 페이지 상단 바 — 제목/부제 + 검색 + 액션 슬롯. 페이지마다 제목이 달라 페이지가 직접 렌더한다.
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
        {action}
      </div>
    </div>
  );
}
