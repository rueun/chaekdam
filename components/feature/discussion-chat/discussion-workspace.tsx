'use client';

import { useState } from 'react';
import { PERSONAS, type PersonaKey } from '@/components/feature/persona/personas';
import { DiscussionChat, type Message } from './discussion-chat';
import { DiscussionList, type DiscussionRoomView } from './discussion-list';
import { openNewChat, type NewChatBook } from './new-chat-modal';

interface DiscussionWorkspaceProps {
  rooms: DiscussionRoomView[];
  /** 방 id별 대화 내용(백엔드 연동 전 샘플) */
  threads: Record<string, Message[]>;
  /** 새 대화 모달의 책 선택 후보 */
  books: NewChatBook[];
}

/**
 * AI 독서토론 화면 조립 — 왼쪽 대화방 레일 + 오른쪽 채팅.
 * 방을 고르면 해당 방의 페르소나·대화로 채팅이 전환된다(채팅 상태는 방별로 분리).
 * 백엔드 연동 시 rooms/threads 는 DiscussionRepository 조회로 대체.
 */
export function DiscussionWorkspace({
  rooms: initialRooms,
  threads: initialThreads,
  books,
}: DiscussionWorkspaceProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState(initialRooms[0]?.id ?? '');

  const active = rooms.find((r) => r.id === activeId) ?? rooms[0];

  // TODO(discussion): StartDiscussionUseCase 호출(방 생성 + 첫 AI 응답)로 교체
  const startNewChat = (book: NewChatBook, persona: PersonaKey) => {
    const id = crypto.randomUUID();
    const room: DiscussionRoomView = {
      id,
      bookTitle: book.title,
      personaKey: persona,
      topic: '새 대화',
      when: '방금',
      turns: 0,
      coverColor: book.coverColor,
    };
    setRooms((prev) => [room, ...prev]);
    setThreads((prev) => ({
      ...prev,
      [id]: [{ id: crypto.randomUUID(), who: 'ai', body: '어떤 이야기부터 시작해 볼까요?' }],
    }));
    setActiveId(id);
  };

  if (!active) return null;

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[280px_1fr]">
      <DiscussionList
        rooms={rooms}
        activeId={active.id}
        onSelect={setActiveId}
        onNewChat={() => openNewChat({ books, onStart: startNewChat })}
      />
      {/* key=방 id — 방 전환 시 채팅 입력·메시지 상태를 새로 시작 */}
      <DiscussionChat
        key={active.id}
        bookTitle={active.bookTitle}
        persona={PERSONAS[active.personaKey]}
        initialMessages={threads[active.id] ?? []}
      />
    </div>
  );
}
