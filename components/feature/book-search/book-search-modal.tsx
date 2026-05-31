'use client';

import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { BookSearch } from './book-search';

/** 책 추가 모달을 띄운다. CTA(책 추가 / 책 더 담기)에서 호출. */
export function openBookSearch() {
  // close 로 unmount 를 넘겨 닫을 때 컴포넌트를 완전히 제거 → 재오픈 시 상태 초기화.
  overlay.open(({ isOpen, unmount }) => (
    <ModalShell
      isOpen={isOpen}
      onClose={unmount}
      eyebrow="책 추가"
      title="어떤 책을 담을까요?"
      className="min-h-[440px] w-[min(820px,100%)]"
    >
      <BookSearch />
    </ModalShell>
  ));
}
