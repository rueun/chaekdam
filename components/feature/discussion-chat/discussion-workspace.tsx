'use client';

import { useState } from 'react';
import { PERSONAS, type PersonaKey } from '@/components/feature/persona/personas';
import { toast } from '@/components/ui/toast';
import { Icon } from '@/components/ui/icon';
import { startDiscussion, continueDiscussion } from '@/app/(dashboard)/discussions/actions';
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

/**
 * AI 독서토론 화면 조립 — 왼쪽 대화방 레일 + 오른쪽 채팅.
 * 방 생성/이어가기는 Server Action(StartDiscussion/ContinueDiscussion)으로 처리하고,
 * 방 전환·낙관적 표시만 클라이언트 상태로 관리한다. 비스트리밍(응답 대기 표시).
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

    const optimistic: MessageView = { id: `tmp-${crypto.randomUUID()}`, who: 'me', body };
    setThreads((prev) => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), optimistic] }));
    setSendingRoomIds((prev) => new Set(prev).add(roomId));

    const result = await continueDiscussion(roomId, body);
    setSendingRoomIds((prev) => {
      const next = new Set(prev);
      next.delete(roomId);
      return next;
    });

    if (result.ok) {
      setThreads((prev) => ({ ...prev, [roomId]: result.messages }));
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, turns: result.messages.length, when: '방금' } : r,
        ),
      );
    } else {
      // 낙관적으로 추가한 사용자 발화를 되돌리고 알린다.
      setThreads((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).filter((m) => m.id !== optimistic.id),
      }));
      toast(result.error);
    }
  };

  if (!active) {
    return (
      <div className="border-divider bg-bg-elevated flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-lg border p-10 text-center">
        <p className="text-fg-2 text-[14px] leading-[1.6]">
          아직 시작한 토론이 없어요.
          <br />
          읽는 중이거나 완독한 책으로 첫 대화를 열어보세요.
        </p>
        <button type="button" className="btn btn-primary" onClick={openModal}>
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
