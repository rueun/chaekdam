'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { StatusBadge, type BookStatusKey } from '@/components/ui/status-badge';
import { toast } from '@/components/ui/toast';
import { ROUTES } from '@/lib/router/routes';
import { HighlightCard, type HighlightView } from '@/components/feature/highlight/highlight-card';
import { PERSONAS, type PersonaKey } from '@/components/feature/persona/personas';
import { openNewChat, type NewChatBook } from '@/components/feature/discussion-chat/new-chat-modal';
import { startDiscussion } from '@/app/(dashboard)/discussions/actions';

export interface BookDetailRoom {
  id: string;
  personaKey: PersonaKey;
  topic: string;
  when: string;
  turns: number;
  active?: boolean;
}

export interface BookDetailSession {
  id: string;
  date: string;
  activity: string;
  range: string;
}

export interface BookDetailView {
  id: string;
  title: string;
  author: string;
  /** 출판사 · 연도 등 부가 정보(도메인 미보유 — 없으면 생략) */
  publisherLine?: string;
  /** 장르 라벨 등(도메인 미보유 — 없으면 생략) */
  eyebrow?: string;
  coverColor: string;
  status: BookStatusKey;
  /** 종이책/전자책 등(도메인 미보유 — 없으면 생략) */
  format?: string;
  /** 책장에 담은 날 라벨 */
  addedAt: string;
  finishedAt?: string;
  bookmark?: number;
  sessions?: number;
  quotesCount: number;
  rating?: number;
  review?: string;
  tags: string[];
  /** 책 소개(도메인 미보유 — 없으면 섹션 생략) */
  intro?: string;
  /** 작가 사망 여부 — '작가 본인' 페르소나 활성 판정(ADR-009) */
  authorDeceased: boolean;
  highlights: HighlightView[];
  rooms: BookDetailRoom[];
  recentSessions: BookDetailSession[];
}

/** 별점을 ★/½/☆ 로 표현 */
function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * 책 상세 — 기록 surface(큰 CTA 없음, 디자인 원본 주석 참고).
 * 표지/메타 + 상태·태그 + (완독)별점 + 통계 + 책 소개 + 담은 한 줄 + AI 토론방 + 최근 세션.
 */
export function BookDetail({ book }: { book: BookDetailView }) {
  const router = useRouter();
  const isDone = book.status === 'done';

  const newChatBook: NewChatBook = {
    id: book.id,
    title: book.title,
    author: book.author,
    statusLabel: isDone ? `완독 ${book.finishedAt ?? ''}`.trim() : '읽는 중',
    coverColor: book.coverColor,
    authorDeceased: book.authorDeceased,
  };

  const startNewChat = () => {
    openNewChat({
      books: [newChatBook],
      onStart: async (b, persona) => {
        const result = await startDiscussion({ bookId: b.id, personaKey: persona });
        if (result.ok) router.push(ROUTES.DISCUSSIONS.LIST());
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      },
    });
  };

  return (
    <div className="grid items-start gap-11 max-[860px]:grid-cols-1 min-[861px]:grid-cols-[260px_1fr]">
      {/* 왼쪽 — 표지 + 메타 */}
      <div className="flex flex-col gap-2.5">
        <div
          className="flex aspect-[2/3] items-end rounded-[10px] px-[18px] py-5 font-serif text-[22px] leading-[1.25] font-semibold tracking-[-0.02em] text-[#FDFBF7] shadow-[var(--shadow-3),inset_-4px_0_0_rgba(0,0,0,0.12)]"
          style={{ background: book.coverColor }}
        >
          {book.title}
        </div>
        <div className="text-fg-2 flex flex-wrap items-center justify-center gap-1.5 text-[12px]">
          {book.format ? (
            <>
              <span>{book.format}</span>
              <span className="text-paper-400">·</span>
            </>
          ) : null}
          <span>{book.addedAt} 담음</span>
        </div>
      </div>

      {/* 오른쪽 — 본문 */}
      <div className="min-w-0">
        {book.eyebrow ? (
          <div className="text-accent text-[11px] font-bold tracking-[0.1em] uppercase">
            {book.eyebrow}
          </div>
        ) : null}
        <h1 className="text-ink-900 mt-1.5 font-serif text-[36px] leading-[1.15] font-semibold tracking-[-0.03em]">
          {book.title}
        </h1>
        <div className="text-fg-2 mt-2 text-[14px]">
          {book.publisherLine ? `${book.author} · ${book.publisherLine}` : book.author}
        </div>

        {/* 상태 · 태그 */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={book.status} />
          {book.format ? <span className="chip chip-soft chip-sm">{book.format}</span> : null}
          {book.tags.map((t) => (
            <span key={t} className="chip chip-sm">
              {t}
            </span>
          ))}
          <button
            type="button"
            onClick={() => toast('태그 입력은 곧 제공돼요')}
            className="border-divider-strong text-fg-3 hover:bg-paper-100 hover:text-ink-700 rounded-full border border-dashed px-2.5 py-1 text-[13px]"
          >
            + 태그
          </button>
        </div>

        {/* 완독 — 별점 · 한 줄 평 */}
        {isDone && book.rating ? (
          <div className="bg-paper-100 mt-[18px] grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-[12px] px-5 py-4">
            <span className="text-accent inline-flex items-baseline gap-2 font-serif text-[22px] leading-none tracking-[2px] whitespace-nowrap">
              {renderStars(book.rating)}
              <small className="text-ink-800 font-mono text-[13px] font-semibold tracking-normal">
                {book.rating.toFixed(1)}
              </small>
            </span>
            <button
              type="button"
              onClick={() => toast('별점 수정은 곧 제공돼요')}
              className="text-accent text-[12px] font-semibold hover:underline"
            >
              별점 수정
            </button>
            {book.review ? (
              <p className="border-divider text-ink-800 col-span-2 border-t pt-2.5 font-serif text-[14px] leading-[1.6] italic">
                &ldquo;{book.review}&rdquo;
              </p>
            ) : null}
          </div>
        ) : null}

        {/* 통계 */}
        <div className="border-divider bg-bg-elevated my-[22px] grid grid-cols-4 gap-4 rounded-[12px] border px-6 py-[22px] max-[560px]:grid-cols-2">
          <Stat
            value={isDone ? '완독' : '읽는 중'}
            label={isDone && book.finishedAt ? `${book.finishedAt} 마침` : '책장에 담음'}
          />
          {!isDone && book.bookmark ? (
            <Stat value={`p.${book.bookmark}`} label="내가 적은 북마크" />
          ) : null}
          {isDone && book.sessions ? (
            <Stat value={book.sessions} unit="세션" label="읽기 횟수" />
          ) : null}
          <Stat value={book.quotesCount} unit="개" label="한 줄 담음" />
          <Stat value={book.addedAt} label="담은 날" />
        </div>

        {book.intro ? (
          <>
            <SectionTitle>책 소개</SectionTitle>
            <p className="text-ink-700 max-w-[660px] text-[15px] leading-[1.75]">{book.intro}</p>
          </>
        ) : null}

        <SectionTitle>이 책에서 담은 한 줄</SectionTitle>
        {book.highlights.length > 0 ? (
          <div className="flex flex-col gap-3">
            {book.highlights.map((h) => (
              <HighlightCard key={h.id} highlight={h} />
            ))}
          </div>
        ) : (
          <p className="text-fg-2 text-[13px]">아직 이 책에서 담은 한 줄이 없어요.</p>
        )}

        <SectionTitle>이 책의 AI 독서토론</SectionTitle>
        <p className="text-fg-2 -mt-2 mb-3.5 max-w-[540px] text-[13px] leading-[1.6]">
          대화방마다 한 명의 토론자와 깊이 이야기해요. 같은 책에 여러 방을 둘 수 있어요.
        </p>
        <ul className="flex flex-col gap-2">
          {book.rooms.map((room) => {
            const persona = PERSONAS[room.personaKey];
            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.DISCUSSIONS.LIST())}
                  className={cn(
                    'group flex w-full items-center gap-3.5 rounded-[12px] border px-4 py-3.5 text-left transition-all hover:-translate-y-px',
                    room.active
                      ? 'border-accent bg-leaf-50'
                      : 'border-divider bg-bg-elevated hover:border-paper-400',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-content-center rounded-[10px]',
                      room.active ? 'bg-accent text-white' : 'bg-leaf-50 text-accent',
                    )}
                  >
                    <Icon name={persona.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-ink-900 font-serif text-[14.5px] font-semibold tracking-[-0.02em]">
                        {persona.name}
                      </span>
                      <span className="text-paper-400 text-[12px]">·</span>
                      <span className="text-ink-700 text-[13px]">{room.topic}</span>
                    </span>
                    <span className="text-fg-3 mt-1 flex gap-1.5 text-[11.5px]">
                      <span>{room.when}</span>
                      <span className="text-paper-400">·</span>
                      <span>{room.turns}번 주고받음</span>
                    </span>
                  </span>
                  <Icon
                    name="chevron-right"
                    size={16}
                    className="text-fg-3 transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={startNewChat}
              className="border-divider-strong hover:bg-paper-100 flex w-full items-center gap-3.5 rounded-[12px] border border-dashed px-4 py-3.5 text-left"
            >
              <span className="bg-paper-100 text-fg-2 grid size-9 shrink-0 place-content-center rounded-[10px]">
                <Icon name="plus" size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-ink-700 block font-serif text-[14.5px] font-semibold tracking-[-0.02em]">
                  새 대화 시작
                </span>
                <span className="text-fg-3 mt-1 block text-[11.5px]">
                  다른 토론자와 이야기해 보세요
                </span>
              </span>
            </button>
          </li>
        </ul>

        {book.recentSessions.length > 0 ? (
          <>
            <SectionTitle>최근 세션</SectionTitle>
            <ol className="border-divider bg-bg-elevated rounded-[12px] border py-2">
              {book.recentSessions.map((s) => (
                <li
                  key={s.id}
                  className="border-divider grid grid-cols-[1fr_auto_1.2fr] items-center gap-3.5 border-b px-5 py-3.5 text-[14px] last:border-b-0"
                >
                  <span className="text-ink-900 font-serif text-[15px] font-semibold tracking-[-0.02em]">
                    {s.date}
                  </span>
                  <span className="text-leaf-700 bg-leaf-50 border-leaf-100 rounded-full border px-2.5 py-[3px] font-mono text-[12px] whitespace-nowrap">
                    {s.activity}
                  </span>
                  <span className="text-fg-2 text-right text-[12px]">{s.range}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ value, unit, label }: { value: string | number; unit?: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <b className="text-ink-900 font-serif text-[22px] leading-none font-semibold tracking-[-0.02em]">
        {value}
        {unit ? <small className="text-fg-2 text-[12px] font-medium"> {unit}</small> : null}
      </b>
      <span className="text-fg-3 text-[11px]">{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-ink-900 mt-7 mb-3.5 text-[16px] font-bold tracking-[-0.02em]">
      {children}
    </h2>
  );
}
