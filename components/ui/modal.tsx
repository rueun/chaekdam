'use client';

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
import { Button } from './button';
import { Icon } from './icon';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  /** 다이얼로그 박스 추가 클래스(너비·최소 높이 등) */
  className?: string;
  children: ReactNode;
}

/**
 * 모달 공통 셸 — scrim + 다이얼로그 + 헤더(제목/닫기). Esc·바깥 클릭 닫기,
 * 배경 스크롤 잠금(스크롤바 보정), 초기 포커스 처리.
 * overlay-kit 의 `open(({ isOpen, unmount }) => <ModalShell ... onClose={unmount}>)` 와 함께 사용.
 */
export function ModalShell({
  isOpen,
  onClose,
  title,
  eyebrow,
  className,
  children,
}: ModalShellProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  // 포커스 트랩 — Tab 이 모달 밖으로 나가지 않도록 순환
  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusables[0];
    const last = focusables.at(-1);
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="bg-ink-900/40 fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'bg-bg-elevated shadow-4 mt-[6vh] mb-8 h-fit w-[min(720px,100%)] rounded-xl p-6 outline-none',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onDialogKeyDown}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <div className="text-fg-3 text-[11px] font-bold tracking-[0.1em] uppercase">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="text-h3 text-ink-900 mt-1 font-serif font-semibold tracking-[-0.02em]">
              {title}
            </h2>
          </div>
          <Button variant="ghost" iconOnly aria-label="닫기" onClick={onClose}>
            <Icon name="x" />
          </Button>
        </header>
        {children}
      </div>
    </div>
  );
}
