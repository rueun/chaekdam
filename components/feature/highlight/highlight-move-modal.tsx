'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { moveHighlight } from '@/app/(dashboard)/highlights/actions';
import { listMyBookOptions, type BookOption } from '@/app/(dashboard)/library/actions';

/** 한 줄을 다른 책으로 옮기는 모달. 성공 시 onMoved 를 호출한다(목록 갱신). */
export function openHighlightMove(highlightId: string, onMoved: () => void) {
  overlay.open(({ isOpen, unmount }) => (
    <HighlightMoveModal
      isOpen={isOpen}
      onClose={unmount}
      highlightId={highlightId}
      onMoved={onMoved}
    />
  ));
}

function HighlightMoveModal({
  isOpen,
  onClose,
  highlightId,
  onMoved,
}: {
  isOpen: boolean;
  onClose: () => void;
  highlightId: string;
  onMoved: () => void;
}) {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookId, setBookId] = useState('');
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let active = true;
    void (async () => {
      try {
        const options = await listMyBookOptions();
        if (active) setBooks(options);
      } catch {
        if (active) toast('책장을 불러오지 못했어요');
      } finally {
        if (active) setBooksLoading(false);
      }
    })();
    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  const noBooks = !booksLoading && books.length === 0;

  const submit = () => {
    if (!bookId) {
      toast('옮길 책을 선택해 주세요');
      return;
    }
    void (async () => {
      setPending(true);
      const result = await moveHighlight({ highlightId, bookId });
      if (!mountedRef.current) return;
      setPending(false);
      if (result.ok) {
        onClose();
        toast('다른 책으로 옮겼어요');
        onMoved();
      } else {
        toast(result.error);
      }
    })();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="한 줄 이동"
      title="다른 책으로 옮기기"
      className="w-[min(480px,100%)]"
    >
      <label className="block">
        <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">옮길 책</span>
        {noBooks ? (
          <p className="border-field-border text-fg-2 rounded-[10px] border border-dashed px-3 py-2.5 text-[13px] leading-[1.5]">
            담을 책이 없어요. 먼저 책장에 책을 담아주세요.
          </p>
        ) : (
          <Select
            aria-label="책 선택"
            value={bookId}
            onChange={setBookId}
            options={books.map((b) => ({ value: b.id, label: b.label }))}
            placeholder={booksLoading ? '책장 불러오는 중…' : '책 선택'}
            disabled={booksLoading}
            className="w-full"
          />
        )}
      </label>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          취소
        </Button>
        <Button variant="primary" onClick={submit} disabled={pending || noBooks}>
          <Icon name="folder-input" size={16} />
          {pending ? '옮기는 중…' : '옮기기'}
        </Button>
      </div>
    </ModalShell>
  );
}
