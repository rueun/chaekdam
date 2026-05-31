'use client';

import { useRef, useState, type ReactNode } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from './modal';
import { Button } from './button';
import { Input } from './input';
import { Icon } from './icon';

interface ConfirmOptions {
  title: string;
  body: ReactNode;
  /** 확인 버튼 라벨(기본 '삭제') */
  confirmText?: string;
  /** 지정 시 이 문구를 그대로 입력해야 확인 가능(위험 작업용) */
  requireType?: string;
}

/**
 * 위험 작업 확인 다이얼로그를 띄우고, 확인 여부를 Promise<boolean> 로 돌려준다.
 * `requireType` 을 주면 해당 문구를 그대로 입력해야만 확인 버튼이 활성화된다.
 */
export function openConfirm(opts: ConfirmOptions): Promise<boolean> {
  return overlay.openAsync<boolean>(({ isOpen, close }) => (
    <ConfirmDialog isOpen={isOpen} opts={opts} onResolve={close} />
  ));
}

function ConfirmDialog({
  isOpen,
  opts,
  onResolve,
}: {
  isOpen: boolean;
  opts: ConfirmOptions;
  onResolve: (value: boolean) => void;
}) {
  const { title, body, confirmText = '삭제', requireType } = opts;
  const [typed, setTyped] = useState('');
  const canConfirm = !requireType || typed === requireType;
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => onResolve(false)}
      title={title}
      hideHeader
      align="center"
      role="alertdialog"
      // 위험 확인창: 입력이 필요하면 입력으로, 아니면 안전한 '취소'로 초기 포커스
      initialFocusRef={requireType ? inputRef : cancelRef}
      className="w-[min(440px,100%)] text-center"
    >
      <div className="bg-clay-100 text-clay-700 mx-auto mb-3.5 grid size-12 place-content-center rounded-full">
        <Icon name="alert-triangle" size={22} aria-label="경고" />
      </div>
      <h2 className="text-h3 text-ink-900 mb-2 font-serif font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      <div className="text-fg-2 [&_b]:text-ink-900 text-[13px] leading-[1.6] [&_b]:font-semibold">
        {body}
      </div>

      {requireType ? (
        <div className="mt-4 text-left">
          <div className="text-fg-3 mb-1.5 text-[12px]">
            계속하려면 <b className="text-ink-900 font-mono font-bold">{requireType}</b>
            (을)를 그대로 입력해 주세요
          </div>
          <Input
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireType}
            aria-label="확인 문구 입력"
          />
        </div>
      ) : null}

      <div className="mt-[18px] flex items-center justify-center gap-2">
        <Button ref={cancelRef} variant="ghost" onClick={() => onResolve(false)}>
          취소
        </Button>
        <Button variant="danger" disabled={!canConfirm} onClick={() => onResolve(true)}>
          {confirmText}
        </Button>
      </div>
    </ModalShell>
  );
}
