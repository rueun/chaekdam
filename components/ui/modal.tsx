'use client';

import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
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
  /** 헤더(제목/닫기)를 숨김 — 확인창처럼 자체 레이아웃을 그릴 때. 제목은 aria-label 로만 사용 */
  hideHeader?: boolean;
  /** 세로 정렬 — 기본 top, center 는 작은 확인창용 */
  align?: 'top' | 'center';
  /** 위험 확인창은 alertdialog */
  role?: 'dialog' | 'alertdialog';
  /** 열릴 때 포커스할 요소(미지정 시 다이얼로그 컨테이너) */
  initialFocusRef?: RefObject<HTMLElement | null>;
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
  hideHeader = false,
  align = 'top',
  role = 'dialog',
  initialFocusRef,
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
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const target = initialFocusRef?.current;
    // 초기 포커스 요소가 다이얼로그 내부에 있을 때만 그곳으로(트랩 보호), 아니면 컨테이너로
    if (target && dialog?.contains(target)) target.focus();
    else dialog?.focus();
  }, [isOpen, initialFocusRef]);

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
      className={cn(
        'bg-ink-900/40 fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 sm:p-8',
        align === 'center' && 'items-center',
      )}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'bg-bg-elevated shadow-4 mb-8 h-fit w-[min(720px,100%)] rounded-xl p-6 outline-none',
          align === 'top' && 'mt-[6vh]',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onDialogKeyDown}
      >
        {hideHeader ? null : (
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
        )}
        {children}
      </div>
    </div>
  );
}
