import { SessionTimer } from '@/components/feature/reader/session-timer';
import { ReaderPane } from '@/components/feature/reader/reader-pane';
import { DiscussionChat } from '@/components/feature/discussion-chat/discussion-chat';

// 샘플 — 추후 '읽는 중' 책장 + ReadingSession 유스케이스로 대체
const BOOK = { title: '일곱 해의 마지막', author: '김연수', coverColor: 'var(--terra-600)' };

export default function ReadingPage() {
  return (
    <>
      {/* 리더 상단 — 현재 책 컨텍스트 + 세션 타이머 (전용 레이아웃이라 TopBar 미사용) */}
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className="aspect-[2/3] w-10 shrink-0 rounded-[4px] shadow-[var(--shadow-spine)]"
            style={{ background: BOOK.coverColor }}
          />
          <div className="min-w-0">
            <div className="text-ink-900 truncate font-serif text-[20px] font-bold tracking-[-0.03em]">
              {BOOK.title}
            </div>
            <div className="text-fg-2 truncate text-[12.5px]">
              {BOOK.author} · 12 세션 · 한 줄 14개 담음
            </div>
          </div>
        </div>
        <SessionTimer />
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-7 max-[1100px]:grid-cols-1">
        <ReaderPane bookTitle={BOOK.title} dateLabel="11월 18일" />
        <DiscussionChat
          bookTitle={BOOK.title}
          persona={{ name: '비평가', role: '분석하는 토론자', icon: 'scan-text' }}
          initialMessages={[
            { id: 'r1', who: 'ai', body: '방금 그은 밑줄, 어떤 점이 마음에 닿았나요?' },
            {
              id: 'r2',
              who: 'me',
              body: '"어떤 문장이 자신의 것인지 알아본다"는 부분이요. 천천히 읽는 일이 결국 나를 읽는 일 같아서요.',
            },
          ]}
        />
      </div>
    </>
  );
}
