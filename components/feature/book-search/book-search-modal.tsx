'use client';

import { useEffect, useRef } from 'react';
import { overlay } from 'overlay-kit';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BookSearch } from './book-search';

/** 책 추가 모달을 띄운다. CTA(책 추가 / 책 더 담기)에서 호출. */
export function openBookSearch() {
  // close 로 unmount 를 넘겨 닫을 때 컴포넌트를 완전히 제거 → 재오픈 시 상태 초기화.
  overlay.open(({ isOpen, unmount }) => <BookSearchModal isOpen={isOpen} close={unmount} />);
}

function BookSearchModal({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc 로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  // 열릴 때 다이얼로그로 초기 포커스 이동 (APG dialog 패턴)
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  // 모달이 열려 있는 동안 배경 스크롤 잠금 (스크롤바 폭만큼 보정해 레이아웃 밀림 방지)
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

  if (!isOpen) return null;

  return (
    <div
      className="bg-ink-900/40 fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 sm:p-8"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="책 추가"
        tabIndex={-1}
        className="bg-bg-elevated shadow-4 mt-[6vh] mb-8 h-fit min-h-[400px] w-[min(820px,100%)] rounded-xl p-6 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-fg-3 text-[11px] font-bold tracking-[0.1em] uppercase">
              책 추가
            </div>
            <h2 className="text-h3 text-ink-900 mt-1 font-serif font-semibold tracking-[-0.02em]">
              어떤 책을 담을까요?
            </h2>
          </div>
          <Button variant="ghost" iconOnly aria-label="닫기" onClick={close}>
            <Icon name="x" />
          </Button>
        </header>

        <BookSearch />
      </div>
    </div>
  );
}
