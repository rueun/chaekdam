'use client';

import { useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { logReadingSession } from '@/app/(dashboard)/reading/actions';

/** 초 → 기록할 분(반올림, 최소 1분). 도메인은 양의 정수 분을 요구한다. */
function secondsToMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}

/** 세션 종료 시 분·페이지를 확인하고 기록하는 모달을 띄운다. */
export function openSessionLog(bookId: string, elapsedSeconds: number, onSaved?: () => void) {
  overlay.open(({ isOpen, unmount }) => (
    <SessionLogModal
      isOpen={isOpen}
      onClose={unmount}
      bookId={bookId}
      elapsedSeconds={elapsedSeconds}
      onSaved={onSaved}
    />
  ));
}

function SessionLogModal({
  isOpen,
  onClose,
  bookId,
  elapsedSeconds,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  elapsedSeconds: number;
  onSaved?: () => void;
}) {
  const minutes = secondsToMinutes(elapsedSeconds);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);

  const handleClose = () => {
    mountedRef.current = false;
    onClose();
  };

  const submit = () => {
    if (pending) return; // Enter 등 다른 경로로의 중복 제출 방지
    const startRaw = startRef.current?.value.trim() ?? '';
    const endRaw = endRef.current?.value.trim() ?? '';
    // 페이지는 둘 다 입력하거나 둘 다 비운다(도메인 불변식과 일치).
    if ((startRaw === '') !== (endRaw === '')) {
      toast('시작·끝 페이지를 모두 입력하거나 모두 비워주세요');
      return;
    }
    // 비숫자/소수를 서버 왕복 전에 차단(도메인은 0 이상 정수만 허용).
    const isPageValue = (value: string) => value === '' || /^\d+$/.test(value);
    if (!isPageValue(startRaw) || !isPageValue(endRaw)) {
      toast('페이지는 0 이상의 숫자로 입력해 주세요');
      return;
    }
    const startPage = startRaw === '' ? null : Number(startRaw);
    const endPage = endRaw === '' ? null : Number(endRaw);
    if (startPage !== null && endPage !== null && endPage < startPage) {
      toast('끝 페이지가 시작 페이지보다 앞설 수 없어요');
      return;
    }

    void (async () => {
      setPending(true);
      const result = await logReadingSession({ bookId, minutes, startPage, endPage });
      if (!mountedRef.current) return;
      setPending(false);
      if (result.ok) {
        handleClose();
        toast(`${minutes}분을 기록했어요`);
        onSaved?.();
      } else {
        toast(result.error);
      }
    })();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="독서 기록"
      title="이번 세션을 기록할까요?"
      className="w-[min(440px,100%)]"
    >
      <div className="bg-surface border-divider mb-4 flex items-center gap-2.5 rounded-[10px] border px-4 py-3">
        <Icon name="play" size={16} className="text-accent" />
        <span className="text-ink-900 text-[15px] font-semibold">약 {minutes}분</span>
        <span className="text-fg-2 text-[13px]">읽었어요</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">
            시작 페이지 (선택)
          </span>
          <Input ref={startRef} placeholder="예: 30" inputMode="numeric" aria-label="시작 페이지" />
        </label>
        <label className="block">
          <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">끝 페이지 (선택)</span>
          <Input ref={endRef} placeholder="예: 58" inputMode="numeric" aria-label="끝 페이지" />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={handleClose} disabled={pending}>
          버리기
        </Button>
        <Button variant="primary" onClick={submit} disabled={pending}>
          <Icon name="check" size={16} />
          {pending ? '기록 중…' : '기록하기'}
        </Button>
      </div>
    </ModalShell>
  );
}
