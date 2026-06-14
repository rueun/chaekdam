'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { cn } from '@/lib/utils/cn';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PERSONAS, PERSONA_ORDER, type PersonaKey } from '@/components/feature/persona/personas';

export interface NewChatBook {
  id: string;
  title: string;
  author: string;
  /** 상태 배지 문구(예: '읽는 중', '완독 5월 7일') */
  statusLabel: string;
  coverColor: string;
  /** 작가 사망 여부 — 사망 작가에 한해 '작가 본인' 페르소나 활성(ADR-009) */
  authorDeceased: boolean;
}

interface NewChatOptions {
  books: NewChatBook[];
  /** 기본 토론자(설정 기본값) */
  defaultPersona?: PersonaKey;
  /** 방 생성(+첫 AI 응답). 성공 시 모달을 닫고, 실패 시 에러를 표시한다. */
  onStart: (book: NewChatBook, persona: PersonaKey) => Promise<{ ok: boolean; error?: string }>;
}

/** 새 대화(토론방) 생성 모달을 띄운다 — 책 선택 + 토론자 선택. */
export function openNewChat(options: NewChatOptions) {
  overlay.open(({ isOpen, unmount }) => (
    <NewChatModal isOpen={isOpen} onClose={unmount} options={options} />
  ));
}

function NewChatModal({
  isOpen,
  onClose,
  options,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: NewChatOptions;
}) {
  const { books, defaultPersona = 'socrates', onStart } = options;
  const [bookId, setBookId] = useState(books[0]?.id ?? '');
  const [persona, setPersona] = useState<PersonaKey>(defaultPersona);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전송 중 외부 dismiss(overlay unmount) 시 setState 경합 방지.
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const selectedBook = books.find((b) => b.id === bookId) ?? books[0];

  // 작가 본인 페르소나는 사망 작가 책에서만 활성(ADR-009)
  const isPersonaDisabled = (key: PersonaKey, book: NewChatBook | undefined) =>
    !!PERSONAS[key].onlyDeceased && !book?.authorDeceased;

  // 책을 바꿀 때 현재 토론자가 새 책에서 비활성이면 기본 토론자로 되돌린다
  const selectBook = (book: NewChatBook) => {
    setBookId(book.id);
    if (isPersonaDisabled(persona, book)) setPersona('socrates');
  };

  const start = async () => {
    if (!selectedBook || starting) return;
    setStarting(true);
    setError(null);
    const result = await onStart(selectedBook, persona);
    if (!mountedRef.current) return;
    if (result.ok) {
      onClose();
      return;
    }
    setError(result.error ?? '토론을 시작하지 못했어요.');
    setStarting(false);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="AI 독서토론"
      title="어떤 책에 대해 이야기할까요?"
      className="w-[min(640px,100%)]"
    >
      <p className="text-fg-2 mb-3.5 text-[13px] leading-[1.65]">
        책담의 토론자가 천천히 질문을 건네드려요. 읽는 중인 책이라면 밑줄 그은 문장부터 시작해
        볼게요.
      </p>

      <SectionLabel>책 선택</SectionLabel>
      <div
        role="radiogroup"
        aria-label="책 선택"
        className="border-divider bg-bg-elevated flex max-h-[340px] flex-col overflow-auto rounded-[12px] border"
      >
        {books.map((book) => {
          const active = book.id === selectedBook?.id;
          return (
            <button
              key={book.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectBook(book)}
              className={cn(
                'border-divider grid grid-cols-[40px_1fr_auto] items-center gap-3.5 border-b px-4 py-3 text-left transition-colors last:border-b-0',
                active ? 'bg-leaf-50' : 'hover:bg-paper-100',
              )}
            >
              <span
                className="flex aspect-[2/3] w-10 items-end rounded-[3px] p-[5px_4px] font-serif text-[9px] leading-[1.15] font-semibold text-[#FDFBF7] shadow-[var(--shadow-spine)]"
                style={{ background: book.coverColor }}
                aria-hidden
              >
                {book.title.slice(0, 4)}
              </span>
              <span className="min-w-0">
                <span className="text-ink-900 block truncate font-serif text-[15px] font-semibold tracking-[-0.02em]">
                  {book.title}
                </span>
                <span className="text-fg-2 mt-0.5 block text-[11px]">{book.author}</span>
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap',
                  active ? 'bg-accent text-white' : 'bg-paper-100 text-ink-700',
                )}
              >
                {book.statusLabel}
              </span>
            </button>
          );
        })}
      </div>

      <SectionLabel>토론자</SectionLabel>
      <p className="text-clay-700 bg-clay-50 border-clay-100 mb-3 flex items-start gap-2 rounded-[10px] border px-3 py-2.5 text-[12px] leading-[1.55]">
        <Icon name="lock" size={14} className="mt-px shrink-0" />
        <span>
          대화를 시작한 뒤에는 토론자를 바꿀 수 없어요. 한 대화방에서는 한 명과 깊이 이야기해요.
        </span>
      </p>
      <div
        role="radiogroup"
        aria-label="토론자 선택"
        className="grid grid-cols-2 gap-2 max-[520px]:grid-cols-1"
      >
        {PERSONA_ORDER.map((key) => {
          const p = PERSONAS[key];
          // 작가 본인은 생존 작가 책에서 비활성(ADR-009)
          const disabled = isPersonaDisabled(key, selectedBook);
          const on = persona === key;
          const sub = disabled ? '이 책은 작가가 생존해 있어요' : p.short;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => setPersona(key)}
              className={cn(
                'flex gap-3 rounded-[12px] border-[1.5px] p-[12px_14px] text-left transition-all',
                disabled
                  ? 'bg-paper-100 border-divider cursor-not-allowed opacity-55'
                  : on
                    ? 'border-accent bg-leaf-50 shadow-[0_0_0_3px_var(--accent-ring)]'
                    : 'border-divider hover:border-paper-400',
              )}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-content-center rounded-lg',
                  on ? 'bg-accent text-white' : 'bg-leaf-50 text-accent',
                )}
              >
                <Icon name={p.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-ink-900 block font-serif text-[14px] font-semibold tracking-[-0.02em]">
                  {p.name}
                </span>
                <span className="text-fg-2 mt-0.5 block text-[11.5px] leading-[1.5]">{sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-danger bg-clay-50 border-clay-100 mt-3 rounded-[10px] border px-3 py-2 text-[12px]">
          {error}
        </p>
      ) : null}

      <div className="border-divider mt-[18px] flex justify-end gap-2 border-t pt-4">
        <Button variant="ghost" onClick={onClose} disabled={starting}>
          취소
        </Button>
        <Button variant="primary" onClick={() => void start()} disabled={starting}>
          <Icon name="sparkles" size={16} />
          {starting ? '시작 중…' : '대화 시작'}
        </Button>
      </div>
    </ModalShell>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-fg-3 mx-1 mt-4 mb-2 text-[11px] font-bold tracking-[0.1em] uppercase">
      {children}
    </div>
  );
}
