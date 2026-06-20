'use client';

import { useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { editHighlight } from '@/app/(dashboard)/highlights/actions';

interface EditTarget {
  id: string;
  content: string;
  page?: string;
}

/** 한 줄 수정 모달을 띄운다. 저장 성공 시 onSaved 를 호출한다(목록 갱신 등). */
export function openHighlightEdit(target: EditTarget, onSaved: () => void) {
  overlay.open(({ isOpen, unmount }) => (
    <HighlightEditModal isOpen={isOpen} onClose={unmount} target={target} onSaved={onSaved} />
  ));
}

function HighlightEditModal({
  isOpen,
  onClose,
  target,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  target: EditTarget;
  onSaved: () => void;
}) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);

  // 닫기는 한 곳으로 — 닫은 뒤 도착하는 응답이 언마운트된 컴포넌트를 건드리지 않게 한다.
  const handleClose = () => {
    mountedRef.current = false;
    onClose();
  };

  const submit = () => {
    const content = contentRef.current?.value.trim() ?? '';
    if (!content) {
      toast('문장을 입력해 주세요');
      return;
    }
    const page = pageRef.current?.value.trim() ?? '';
    void (async () => {
      setPending(true);
      const result = await editHighlight({
        highlightId: target.id,
        content,
        page: page.length > 0 ? page : null,
      });
      if (!mountedRef.current) return;
      setPending(false);
      if (result.ok) {
        handleClose();
        toast('한 줄을 수정했어요');
        onSaved();
      } else {
        toast(result.error);
      }
    })();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="한 줄 수정"
      title="문장 다듬기"
      className="w-[min(560px,100%)]"
    >
      <div className="flex flex-col gap-3.5">
        <label className="block">
          <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">문장</span>
          <textarea
            ref={contentRef}
            aria-label="문장"
            defaultValue={target.content}
            rows={4}
            className="bg-bg-elevated text-ink-900 focus:border-leaf-400 border-field-border w-full rounded-[10px] border p-3 font-serif text-[15px] leading-[1.6] outline-none focus:shadow-[0_0_0_2px_var(--accent-ring)]"
          />
        </label>
        <label className="block max-w-[160px]">
          <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">페이지</span>
          <Input
            ref={pageRef}
            defaultValue={target.page ?? ''}
            placeholder="예: 42"
            inputMode="numeric"
            aria-label="페이지"
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={handleClose} disabled={pending}>
          취소
        </Button>
        <Button variant="primary" onClick={submit} disabled={pending}>
          <Icon name="check" size={16} />
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </ModalShell>
  );
}
