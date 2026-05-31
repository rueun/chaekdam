'use client';

import type { ReactNode } from 'react';
import { openCapture } from './capture-modal';

/** 한 줄 담기 모달을 여는 버튼. className 으로 외형 주입(.btn 등). */
export function CaptureTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={openCapture}>
      {children}
    </button>
  );
}
