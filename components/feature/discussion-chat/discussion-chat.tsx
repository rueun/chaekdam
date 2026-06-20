'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import type { Persona } from '@/components/feature/persona/personas';
import type { MessageView } from './discussion-view';

interface DiscussionChatProps {
  bookTitle: string;
  persona: Persona;
  messages: MessageView[];
  /** 응답 대기 중(입력 잠금 + 타이핑 표시) */
  sending?: boolean;
  /** 전송 핸들러. 없으면 읽기 전용(미리보기) — Server Component 에서 함수 전달 불가하므로 선택적. */
  onSend?: (content: string) => void;
}

/**
 * AI 독서토론 채팅 — 페르소나 헤더 + 메시지 + 입력.
 * 메시지는 상위(workspace)가 관리하는 controlled 컴포넌트. 전송은 Server Action 으로 위임.
 * onSend 가 없으면 입력이 비활성화된 읽기 전용 미리보기로 동작한다.
 */
export function DiscussionChat({
  bookTitle,
  persona,
  messages,
  sending = false,
  onSend,
}: DiscussionChatProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const readOnly = !onSend;

  // 새 메시지·대기 상태 변화 시 최신 위치로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const send = () => {
    const body = text.trim();
    if (!body || sending || !onSend) return;
    onSend(body);
    setText('');
  };

  return (
    <div className="border-divider bg-bg-elevated flex h-full min-h-[560px] flex-col rounded-lg border">
      {/* 헤더 — 페르소나 (생성 후 고정) */}
      <div className="border-divider flex items-center gap-3 border-b px-[18px] py-3.5">
        <span className="bg-leaf-50 text-accent flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <Icon name={persona.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-ink-900 font-serif text-[15px] font-semibold tracking-[-0.02em]">
              {persona.name}
            </span>
            <span
              className="border-divider bg-surface text-fg-3 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.04em]"
              title="대화방을 시작한 뒤에는 토론자를 바꿀 수 없어요"
            >
              <Icon name="lock" size={10} />
              고정됨
            </span>
          </div>
          <div className="text-fg-2 mt-0.5 text-[12px]">
            『{bookTitle}』 · {persona.role}
          </div>
        </div>
      </div>

      {/* 메시지 */}
      <div
        role="log"
        aria-label="대화 내용"
        aria-live="polite"
        className="flex flex-1 flex-col gap-2.5 overflow-auto p-5"
      >
        {messages.map((m) => {
          const isMe = m.who === 'me';
          return (
            <div
              key={m.id}
              className={cn('flex max-w-[92%] gap-2.5', isMe && 'flex-row-reverse self-end')}
            >
              <span
                className={cn(
                  'flex size-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-[0.04em]',
                  isMe ? 'bg-accent text-white' : 'bg-talk-100 text-talk-700',
                )}
              >
                {isMe ? '나' : 'AI'}
              </span>
              <div
                className={cn(
                  'rounded-[14px] px-3.5 py-2.5 text-[14px] leading-[1.55] tracking-[-0.01em]',
                  isMe
                    ? 'bg-accent rounded-tr-[4px] text-white'
                    : 'bg-surface text-ink-900 rounded-tl-[4px]',
                )}
              >
                {m.body}
              </div>
            </div>
          );
        })}

        {/* 응답 대기 표시 — AI 발화가 흐르기 전(마지막이 내 메시지)일 때만. 스트림이 시작되면 채워지는 말풍선이 대신한다. */}
        {sending && messages.at(-1)?.who !== 'ai' ? (
          <div className="flex max-w-[92%] gap-2.5">
            <span className="bg-talk-100 text-talk-700 flex size-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              AI
            </span>
            <div className="bg-surface text-fg-3 rounded-[14px] rounded-tl-[4px] px-3.5 py-2.5 text-[14px]">
              <span className="sr-only">응답을 작성하고 있어요</span>
              <span aria-hidden>· · ·</span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} aria-hidden />
      </div>

      {/* 입력 */}
      <div className="border-divider flex items-center gap-2 border-t px-4 py-3.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // IME 조합 중 Enter 는 무시(한글 입력 중복 전송 방지)
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) send();
          }}
          disabled={sending || readOnly}
          placeholder={sending ? '응답을 기다리는 중…' : '생각을 적어보세요…'}
          aria-label="메시지 입력"
          className="border-divider-strong bg-bg text-ink-900 focus:border-accent flex-1 rounded-full border px-3.5 py-2.5 text-[13px] outline-none focus:shadow-[0_0_0_3px_var(--accent-ring)] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || readOnly}
          aria-label="보내기"
          className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-60"
        >
          <Icon name="arrow-up" size={16} />
        </button>
      </div>
    </div>
  );
}
