'use client';

import { useState } from 'react';
import { PERSONAS, type PersonaKey } from '@/components/feature/persona/personas';
import { toast } from '@/components/ui/toast';
import { Icon } from '@/components/ui/icon';
import { startDiscussion } from '@/app/(dashboard)/discussions/actions';
import { ROUTES } from '@/lib/router/routes';
import { DiscussionChat } from './discussion-chat';
import { DiscussionList, type DiscussionRoomView } from './discussion-list';
import { openNewChat, type NewChatBook } from './new-chat-modal';
import type { MessageView } from './discussion-view';

interface DiscussionWorkspaceProps {
  rooms: DiscussionRoomView[];
  /** 방 id별 대화 내용 */
  threads: Record<string, MessageView[]>;
  /** 새 대화 모달의 책 선택 후보(읽는 중·완독) */
  books: NewChatBook[];
}

/** 스트림 전체 타임아웃 — 행 걸린 연결이 방을 영구 잠그지 않도록 하는 안전망. */
const STREAM_TIMEOUT_MS = 120_000;

/**
 * AI 독서토론 화면 조립 — 왼쪽 대화방 레일 + 오른쪽 채팅.
 * 방 생성은 Server Action(StartDiscussion), 이어가기는 스트리밍 Route Handler(ADR-017)로 처리한다.
 * 방 전환·낙관적 표시·스트림 누적만 클라이언트 상태로 관리한다.
 */
export function DiscussionWorkspace({
  rooms: initialRooms,
  threads: initialThreads,
  books,
}: DiscussionWorkspaceProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState(initialRooms[0]?.id ?? '');
  /** 응답 대기 중인 방 id 집합 — 방별 독립 잠금(전송 중 입력 잠금·타이핑 표시) */
  const [sendingRoomIds, setSendingRoomIds] = useState<ReadonlySet<string>>(new Set());

  const active = rooms.find((r) => r.id === activeId) ?? rooms[0];

  const startNewChat = async (book: NewChatBook, persona: PersonaKey) => {
    const result = await startDiscussion({ bookId: book.id, personaKey: persona });
    if (!result.ok) return { ok: false as const, error: result.error };

    const room: DiscussionRoomView = {
      id: result.discussionId,
      bookTitle: book.title,
      personaKey: persona,
      topic: result.title ?? '대화',
      when: '방금',
      turns: result.messages.length,
      coverColor: book.coverColor,
    };
    setRooms((prev) => [room, ...prev]);
    setThreads((prev) => ({ ...prev, [result.discussionId]: result.messages }));
    setActiveId(result.discussionId);
    return { ok: true as const };
  };

  const openModal = () => openNewChat({ books, onStart: startNewChat });

  const handleSend = async (roomId: string, content: string) => {
    const body = content.trim();
    if (!body || sendingRoomIds.has(roomId)) return;

    // 사용자 발화를 낙관적으로 추가하고, AI 응답은 스트림이 도착하는 대로 채운다.
    const userMsg: MessageView = { id: `tmp-${crypto.randomUUID()}`, who: 'me', body };
    const aiId = `tmp-${crypto.randomUUID()}`;
    setThreads((prev) => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), userMsg] }));
    setSendingRoomIds((prev) => new Set(prev).add(roomId));

    let aiText = '';
    let started = false;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    // 델타를 AI 말풍선에 누적한다(첫 델타에 말풍선 생성, 이후 갱신).
    const pushDelta = (delta: string) => {
      aiText += delta;
      if (started) {
        setThreads((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] ?? []).map((m) => (m.id === aiId ? { ...m, body: aiText } : m)),
        }));
      } else {
        started = true;
        setThreads((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] ?? []), { id: aiId, who: 'ai', body: aiText }],
        }));
      }
    };

    try {
      const res = await fetch(ROUTES.API.DISCUSSIONS.STREAM(roomId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: body }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`stream request failed: ${res.status}`);

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) pushDelta(chunk);
      }
      const tail = decoder.decode(); // 청크 경계에 걸린 멀티바이트(한글) 잔여 바이트 flush
      if (tail) pushDelta(tail);
      if (!aiText.trim()) throw new Error('empty stream');

      // 성공 — 방 턴 수(사용자 +1, AI +1) 갱신
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, turns: r.turns + 2, when: '방금' } : r)),
      );
    } catch (error) {
      // 낙관적 사용자 발화 + (있다면) AI 임시 메시지를 되돌리고 알린다.
      setThreads((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).filter((m) => m.id !== userMsg.id && m.id !== aiId),
      }));
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      toast(
        timedOut
          ? '응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.'
          : 'AI 응답에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      clearTimeout(timeout);
      reader?.releaseLock();
      setSendingRoomIds((prev) => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <span
          className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
          aria-hidden
        >
          <Icon name="messages-square" size={28} />
        </span>
        <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
          아직 시작한 토론이 없어요
        </div>
        <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
          읽는 중이거나 완독한 책으로 첫 대화를 열어보세요. 페르소나가 책에 대해 천천히 질문을
          건네요.
        </p>
        <button type="button" className="btn btn-primary mt-2" onClick={openModal}>
          <Icon name="plus" size={16} />새 대화 시작
        </button>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[280px_1fr]">
      <DiscussionList
        rooms={rooms}
        activeId={active.id}
        onSelect={setActiveId}
        onNewChat={openModal}
      />
      {/* key=방 id — 방 전환 시 입력창 상태를 새로 시작 */}
      <DiscussionChat
        key={active.id}
        bookTitle={active.bookTitle}
        persona={PERSONAS[active.personaKey]}
        messages={threads[active.id] ?? []}
        sending={sendingRoomIds.has(active.id)}
        onSend={(content) => void handleSend(active.id, content)}
      />
    </div>
  );
}
