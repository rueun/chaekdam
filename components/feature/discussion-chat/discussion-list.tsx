'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { PERSONAS, type PersonaKey } from '@/components/feature/persona/personas';

export interface DiscussionRoomView {
  id: string;
  bookTitle: string;
  personaKey: PersonaKey;
  /** 방 주제(예: '4장 · 빛나는 것들에 대하여') */
  topic: string;
  /** 마지막 대화 시점(표시용) */
  when: string;
  /** 주고받은 턴 수 */
  turns: number;
  /** 도서별 보기 그룹 표지 색 */
  coverColor: string;
}

interface DiscussionListProps {
  rooms: DiscussionRoomView[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

const VIEW_OPTIONS = [
  { value: 'recent', label: '최근 대화' },
  { value: 'book', label: '도서별 보기' },
];

/**
 * AI 독서토론 왼쪽 레일 — 새 대화 시작 + 최근/도서별 탭 + 대화방 목록.
 * 한 책에 여러 대화방이 있을 수 있고, 각 방은 고정된 페르소나 하나를 가진다(ADR-009).
 */
export function DiscussionList({ rooms, activeId, onSelect, onNewChat }: DiscussionListProps) {
  const [view, setView] = useState('recent');
  const [bookFilter, setBookFilter] = useState('all');

  // 도서 제목으로 묶기 — 방 순서를 보존(각 책의 최신 방이 위로).
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { title: string; coverColor: string; rooms: DiscussionRoomView[] }
    >();
    for (const room of rooms) {
      const group = map.get(room.bookTitle);
      if (group) group.rooms.push(room);
      else
        map.set(room.bookTitle, {
          title: room.bookTitle,
          coverColor: room.coverColor,
          rooms: [room],
        });
    }
    return Array.from(map.values());
  }, [rooms]);

  const bookOptions = [
    { value: 'all', label: '전체 도서' },
    ...grouped.map((g) => ({ value: g.title, label: g.title })),
  ];

  return (
    <aside className="border-divider bg-bg-elevated flex flex-col gap-3.5 rounded-[14px] border p-[18px]">
      <button type="button" className="btn btn-primary w-full justify-center" onClick={onNewChat}>
        <Icon name="plus" size={16} />새 대화 시작
      </button>

      <Segmented
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        aria-label="대화방 보기 방식"
        className="flex w-full [&_.s]:flex-1 [&_.s]:text-center"
      />

      {view === 'book' ? (
        <Select
          options={bookOptions}
          value={bookFilter}
          onChange={setBookFilter}
          aria-label="도서 선택"
          className="w-full [&_.sel]:w-full"
        />
      ) : null}

      {view === 'recent' ? (
        <div className="flex flex-col gap-1">
          {rooms.map((room) => (
            <RoomButton
              key={room.id}
              room={room}
              active={room.id === activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {grouped
            .filter((g) => bookFilter === 'all' || g.title === bookFilter)
            .map((g) => (
              <section key={g.title} className="flex flex-col gap-1">
                <header className="flex items-center gap-2.5 px-1 pt-1 pb-1.5">
                  <span
                    className="aspect-[2/3] w-6 shrink-0 rounded-[2.5px] shadow-[var(--shadow-spine)]"
                    style={{ background: g.coverColor }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-ink-900 truncate font-serif text-[14px] font-bold tracking-[-0.02em]">
                      {g.title}
                    </div>
                    <div className="text-fg-3 mt-0.5 text-[10.5px] tracking-[0.04em]">
                      대화방 {g.rooms.length}개
                    </div>
                  </div>
                </header>
                <div className="border-divider ml-[11px] flex flex-col gap-1 border-l pl-3">
                  {g.rooms.map((room) => (
                    <RoomButton
                      key={room.id}
                      room={room}
                      active={room.id === activeId}
                      compact
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </aside>
  );
}

interface RoomButtonProps {
  room: DiscussionRoomView;
  active: boolean;
  compact?: boolean;
  onSelect: (id: string) => void;
}

function RoomButton({ room, active, compact, onSelect }: RoomButtonProps) {
  const persona = PERSONAS[room.personaKey];
  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors',
        active ? 'bg-leaf-50 border-leaf-100' : 'hover:bg-paper-100 border-transparent',
      )}
    >
      {!compact ? (
        <span className="text-ink-900 text-[13px] font-bold">{room.bookTitle}</span>
      ) : null}
      <span
        className={cn(
          'mt-1 inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10.5px] font-semibold tracking-[0.02em]',
          active ? 'border-leaf-100 text-accent border bg-white' : 'bg-leaf-50 text-accent',
        )}
      >
        <Icon name={persona.icon} size={11} />
        {persona.name}
      </span>
      <span className="text-fg-2 mt-1 text-[11px]">{room.topic}</span>
      <span className="text-fg-3 mt-0.5 font-mono text-[10px]">
        {room.when} · {room.turns}번
      </span>
    </button>
  );
}
