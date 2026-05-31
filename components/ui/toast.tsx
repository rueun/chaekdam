'use client';

import { useEffect, useRef } from 'react';
import { overlay } from 'overlay-kit';

const TOAST_DURATION_MS = 2200;
// 고정 id — 연속 호출 시 새 토스트가 이전 것을 대체(겹침 방지). 단일 토스트 기준.
const TOAST_OVERLAY_ID = 'app-toast';

/** 하단 중앙에 잠깐 떴다 사라지는 알림. */
export function toast(message: string) {
  overlay.open(
    ({ isOpen, unmount }) => <ToastView isOpen={isOpen} message={message} onDone={unmount} />,
    {
      overlayId: TOAST_OVERLAY_ID,
    },
  );
}

function ToastView({
  isOpen,
  message,
  onDone,
}: {
  isOpen: boolean;
  message: string;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-ink-900 text-body-sm shadow-3 fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-4 py-2.5 text-white"
    >
      {message}
    </div>
  );
}
