'use client';

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { overlay } from 'overlay-kit';
import { cn } from '@/lib/utils/cn';
import { Icon, type IconName } from './icon';

export interface QuoteMenuHandlers {
  onEdit?: () => void;
  onPin?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const MENU_WIDTH = 240;
const MENU_EST_HEIGHT = 280;

/** 한 줄 카드 더보기(⋯) 메뉴를 앵커 요소 기준으로 띄운다. */
export function openQuoteMenu(anchor: HTMLElement, handlers: QuoteMenuHandlers) {
  const rect = anchor.getBoundingClientRect();
  const top = Math.min(window.innerHeight - MENU_EST_HEIGHT, rect.bottom + 6);
  const left = Math.min(window.innerWidth - MENU_WIDTH - 12, Math.max(8, rect.right - MENU_WIDTH));
  overlay.open(({ isOpen, unmount }) => (
    <QuoteMenu isOpen={isOpen} onClose={unmount} top={top} left={left} handlers={handlers} />
  ));
}

function QuoteMenu({
  isOpen,
  onClose,
  top,
  left,
  handlers,
}: {
  isOpen: boolean;
  onClose: () => void;
  top: number;
  left: number;
  handlers: QuoteMenuHandlers;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);

  // 열릴 때 첫 항목으로 포커스 이동(메뉴 패턴)
  useEffect(() => {
    if (isOpen) items()[0]?.focus();
  }, [isOpen]);

  // ↑↓/Home/End 로 항목 간 포커스 이동
  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = items();
    if (list.length === 0) return;
    const current = list.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = (current + 1) % list.length;
    else if (e.key === 'ArrowUp') next = (current - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    if (next >= 0) {
      e.preventDefault();
      list[next]?.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 메뉴 항목 실행 후 닫기
  const run = (fn?: () => void) => () => {
    onClose();
    fn?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} aria-hidden />
      <div
        ref={menuRef}
        role="menu"
        aria-label="한 줄 메뉴"
        tabIndex={-1}
        onKeyDown={onMenuKeyDown}
        style={{ top, left, width: MENU_WIDTH }}
        className="border-divider bg-bg-elevated shadow-4 fixed z-50 rounded-xl border p-1.5 outline-none"
      >
        <MenuRow icon="pen-line" onClick={run(handlers.onEdit)}>
          문장 수정
        </MenuRow>
        <MenuRow icon="pin" onClick={run(handlers.onPin)}>
          홈에 고정
        </MenuRow>
        <MenuRow icon="copy" kbd="⌘C" onClick={run(handlers.onCopy)}>
          텍스트 복사
        </MenuRow>
        <Separator />
        <MenuRow icon="folder-input" onClick={run(handlers.onMove)}>
          다른 책으로 이동
        </MenuRow>
        <MenuRow icon="archive" onClick={run(handlers.onArchive)}>
          보관함에 넣기
        </MenuRow>
        <Separator />
        <MenuRow icon="trash-2" danger onClick={run(handlers.onDelete)}>
          한 줄 삭제
        </MenuRow>
      </div>
    </>
  );
}

function MenuRow({
  icon,
  kbd,
  danger,
  onClick,
  children,
}: {
  icon: IconName;
  kbd?: string;
  danger?: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
        danger ? 'text-danger hover:bg-clay-50' : 'text-ink-800 hover:bg-paper-100',
      )}
    >
      <Icon name={icon} size={16} />
      {children}
      {kbd ? <span className="text-fg-3 ml-auto font-mono text-[11px]">{kbd}</span> : null}
    </button>
  );
}

function Separator() {
  return <div className="bg-divider mx-1 my-1.5 h-px" aria-hidden />;
}
