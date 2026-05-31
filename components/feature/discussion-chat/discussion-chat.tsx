'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon, type IconName } from '@/components/ui/icon';

const DUMMY_AI_DELAY_MS = 600;

interface Persona {
  name: string;
  role: string;
  icon: IconName;
}

interface Message {
  id: string;
  who: 'me' | 'ai';
  body: string;
}

interface DiscussionChatProps {
  bookTitle: string;
  persona: Persona;
  initialMessages: Message[];
}

/**
 * AI 독서토론 채팅 — 페르소나 헤더 + 메시지 + 입력.
 * (백엔드 연결 전 더미 응답. 실연동 시 AiDiscussionPartner Port + 스트리밍으로 교체.)
 */
export function DiscussionChat({ bookTitle, persona, initialMessages }: DiscussionChatProps) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 최신 위치로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // 언마운트 시 대기 중인 더미 응답 타이머 정리
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), who: 'me', body }]);
    setText('');
    // 더미 AI 응답 — 실연동 시 AiDiscussionPartner Port(스트리밍) 호출로 교체
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          who: 'ai',
          body: '그 마음을 한 문장으로 적어둔다면 어떻게 표현해 보고 싶으세요?',
        },
      ]);
    }, DUMMY_AI_DELAY_MS);
    timersRef.current.push(timer);
  };

  return (
    <div className="border-divider bg-bg-elevated flex min-h-[560px] max-w-3xl flex-col rounded-lg border">
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
        <div className="border-leaf-100 bg-leaf-50 text-leaf-700 mb-3 flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-[13px]">
          <Icon name="sparkles" size={14} className="mt-0.5" />
          <div>
            방금 밑줄 그은 문장으로 <b className="font-bold">대화를 시작해 볼까요?</b>
          </div>
        </div>

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
          placeholder="생각을 적어보세요…"
          aria-label="메시지 입력"
          className="border-divider-strong bg-bg text-ink-900 focus:border-accent flex-1 rounded-full border px-3.5 py-2.5 text-[13px] outline-none focus:shadow-[0_0_0_3px_var(--accent-ring)]"
        />
        <button
          type="button"
          onClick={send}
          aria-label="보내기"
          className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-full text-white"
        >
          <Icon name="arrow-up" size={16} />
        </button>
      </div>
    </div>
  );
}
