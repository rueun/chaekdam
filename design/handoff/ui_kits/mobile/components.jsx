/* global React */
const { useState } = React;

// ---------------- icons (inline strokes) ----------------
const Ic = {
  home: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  library: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="10" y="4" width="5" height="16" rx="1" />
      <path d="M17 5l3 .8L18 21l-3-.8z" />
    </svg>
  ),
  spark: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  cam: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
  user: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
  plus: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  arrow: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  send: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  back: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  more: (
    <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  ),
  search: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  toc: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  sun: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </svg>
  ),
  bookmark: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4h10v17l-5-3-5 3z" />
    </svg>
  ),
  share: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M5 14v5h14v-5" />
    </svg>
  ),
  flip: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </svg>
  ),
  flash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  check: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 12 5 5L20 6" />
    </svg>
  ),
  chev: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  bell: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  cog: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.4.6.7 1.1.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  bm: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4h10v17l-5-3-5 3z" />
    </svg>
  ),
};

// ---------------- shared bits ----------------
const Cover = ({ title, author, hue }) => (
  <div className="cv" style={{ background: hue }}>
    {title}
  </div>
);
const HUES = [
  'linear-gradient(155deg, #3F6750, #1F4030)',
  'linear-gradient(160deg, #4A6741, #2A3E25)',
  'linear-gradient(155deg, #2E3A4A, #1A2230)',
  'linear-gradient(155deg, #6F684A, #3A2F1A)',
  'linear-gradient(160deg, #6F4E7C, #3E2B47)',
  'linear-gradient(160deg, #4F6B7B, #2C3E48)',
];

// ---------------- Reading log (monthly calendar) ----------------
// One month at a time with prev/next navigation. The mock dataset
// covers 5 recent months; "today" is fixed at Nov 18 2025 for the
// streak ring + future-day shading.
const TODAY = { y: 2025, m: 11, d: 18 };
const LOG_DATA = {
  '2025-07': { read: [2, 3, 4, 6, 7, 10, 11, 14, 15, 16, 18, 21, 22, 24, 27, 28, 29, 30, 31] },
  '2025-08': { read: [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 17, 18, 19, 22, 23, 25, 26, 28, 29] },
  '2025-09': { read: [1, 2, 4, 5, 6, 9, 10, 11, 12, 15, 18, 19, 20, 22, 25, 27, 28, 30] },
  '2025-10': {
    read: [2, 3, 4, 5, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 24, 25, 28, 29, 30, 31],
  },
  '2025-11': { read: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
};
const MONTH_NAMES = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

function ReadingLog() {
  const [cursor, setCursor] = useState({ y: TODAY.y, m: TODAY.m });
  const key = `${cursor.y}-${String(cursor.m).padStart(2, '0')}`;
  const data = LOG_DATA[key] || { read: [] };
  const readDays = new Set(data.read);

  const daysInMonth = new Date(cursor.y, cursor.m, 0).getDate();
  const firstDow = new Date(cursor.y, cursor.m - 1, 1).getDay(); // 0=Sun
  const dows = ['일', '월', '화', '수', '목', '금', '토'];

  const isCurrentMonth = cursor.y === TODAY.y && cursor.m === TODAY.m;
  const isPastMonth = cursor.y < TODAY.y || (cursor.y === TODAY.y && cursor.m < TODAY.m);
  const hasNext =
    !!LOG_DATA[`${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`] ||
    !!LOG_DATA[`${cursor.y + 1}-01`];
  const hasPrev =
    !!LOG_DATA[`${cursor.y}-${String(cursor.m - 1).padStart(2, '0')}`] ||
    !!LOG_DATA[`${cursor.y - 1}-12`];

  const goPrev = () => {
    const nm = cursor.m === 1 ? { y: cursor.y - 1, m: 12 } : { y: cursor.y, m: cursor.m - 1 };
    if (LOG_DATA[`${nm.y}-${String(nm.m).padStart(2, '0')}`]) setCursor(nm);
  };
  const goNext = () => {
    const nm = cursor.m === 12 ? { y: cursor.y + 1, m: 1 } : { y: cursor.y, m: cursor.m + 1 };
    if (LOG_DATA[`${nm.y}-${String(nm.m).padStart(2, '0')}`]) setCursor(nm);
  };

  return (
    <div className="m-streak">
      <div className="m-streak-eyebrow">독서 기록</div>
      <div className="m-streak-head">
        <button className="nav-btn" onClick={goPrev} disabled={!hasPrev} aria-label="이전 달">
          ‹
        </button>
        <div className="m-streak-title">
          {cursor.y}년 {MONTH_NAMES[cursor.m - 1]}
        </div>
        <button className="nav-btn" onClick={goNext} disabled={!hasNext} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className="m-cal-dow">
        {dows.map((d, i) => (
          <span key={d} className={i === 0 ? 'is-sun' : i === 6 ? 'is-sat' : ''}>
            {d}
          </span>
        ))}
      </div>

      <div className="m-cal">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`b${i}`} className="cd is-blank" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dow = (firstDow + i) % 7;
          const isRead = readDays.has(day);
          const isToday = isCurrentMonth && day === TODAY.d;
          const isFuture = isCurrentMonth && day > TODAY.d;
          const cls = ['cd'];
          if (isRead) cls.push('is-read');
          if (isFuture) cls.push('is-future');
          if (isToday) cls.push('is-today');
          if (dow === 0) cls.push('is-sun');
          if (dow === 6) cls.push('is-sat');
          return (
            <div key={day} className={cls.join(' ')}>
              {day}
            </div>
          );
        })}
      </div>

      <div className="m-streak-foot">
        {isCurrentMonth ? (
          <>
            <span>
              <b>{readDays.size}일</b> 읽음
            </span>
            <span className="dot">·</span>
            <span>
              <b>14일</b> 연속
            </span>
            <span className="dot">·</span>
            <span>
              한 줄 <b>{Math.round(readDays.size * 0.7)}개</b>
            </span>
          </>
        ) : isPastMonth ? (
          <>
            <span>
              <b>{readDays.size}일</b> 읽음
            </span>
            <span className="dot">·</span>
            <span>
              한 달 중 <b>{Math.round((readDays.size / daysInMonth) * 100)}%</b>
            </span>
          </>
        ) : (
          <span>아직 기록이 없어요</span>
        )}
      </div>
    </div>
  );
}

// ---------------- Home / Today ----------------
function HomeScreen({
  onOpenReader,
  onOpenChat,
  onOpenCapture,
  onOpenStats,
  onOpenQuote,
  onOpenQuotes,
}) {
  return (
    <div data-screen-label="01 Home">
      <div className="m-top">
        <div className="greet">
          <div className="name">화요일 · 11월 18일</div>
          <b style={{ fontSize: 18 }}>안녕하세요, 길동님</b>
        </div>
        <div className="avatar">길</div>
      </div>

      <div className="m-hero">
        <div className="row">
          <Cover title="작별인사" hue={HUES[1]} />
          <div style={{ flex: 1 }}>
            <div className="ttl">작별인사</div>
            <div className="auth">김영하 · 장편소설</div>
            <div className="pm" style={{ marginTop: 8 }}>
              현재 p.112 · 한 줄 5개 담음
            </div>
          </div>
        </div>
        <button className="cta" onClick={onOpenReader}>
          이어서 읽기 {Ic.arrow}
        </button>
      </div>

      <div className="m-actions">
        <button className="m-action" onClick={onOpenChat}>
          {Ic.spark}
          <div className="lbl">AI 독서토론</div>
        </button>
        <button className="m-action" onClick={onOpenCapture}>
          {Ic.cam}
          <div className="lbl">한 줄 담기</div>
        </button>
        <button className="m-action" onClick={onOpenStats}>
          {Ic.bm}
          <div className="lbl">독서 기록</div>
        </button>
      </div>

      <ReadingLog />

      <div className="m-section">
        <div className="m-h2">최근 밑줄</div>
        <a onClick={onOpenQuotes} style={{ cursor: 'pointer' }}>
          전체
        </a>
      </div>
      <div className="m-quote" onClick={onOpenQuote} style={{ cursor: 'pointer' }}>
        <div className="qt">
          좋은 책을 읽는다는 것은 <mark>과거 몇 세기의 가장 훌륭한 사람들과 대화하는 것</mark>과
          같다.
        </div>
        <div className="qm">
          <b>데카르트</b> · 방법서설 · 3일 전
        </div>
      </div>
      <div className="m-quote" onClick={onOpenQuote} style={{ cursor: 'pointer' }}>
        <div className="qt">사람은 자기가 좋아하는 것에 대해서만 깊이 생각할 수 있다.</div>
        <div className="qm">
          <b>김영하</b> · 작별인사 · 어제
        </div>
      </div>
    </div>
  );
}

// ---------------- Library ----------------
function LibraryScreen({ onOpenBook, onOpenSearch, onAddBook, onOpenWishlist }) {
  const [active, setActive] = useState('reading');
  const books = [
    { t: '작별인사', a: '김영하', i: 1 },
    { t: '아주 사적인 도시 산책', a: '정수윤', i: 3 },
    { t: '시선으로부터,', a: '정세랑', i: 4 },
    { t: '여행의 이유', a: '김영하', i: 5 },
    { t: '쇼코의 미소', a: '최은영', i: 2 },
    { t: '코스모스', a: '칼 세이건', i: 0 },
  ];
  return (
    <div data-screen-label="02 Library">
      <div className="m-top">
        <div>
          <div className="m-h1">내 서재</div>
          <div className="m-sub">총 47권 · 읽는 중 3권</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="avatar"
            style={{ background: 'transparent', color: 'var(--ink-700)' }}
            onClick={onOpenSearch}
          >
            {Ic.search}
          </button>
          <button
            className="avatar"
            style={{ background: 'transparent', color: 'var(--ink-700)' }}
            onClick={onAddBook}
          >
            {Ic.plus}
          </button>
        </div>
      </div>
      <div className="m-chips">
        {[
          ['reading', '읽는 중'],
          ['done', '완독'],
          ['wish', '읽고 싶은'],
          ['paused', '쉬는 중'],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`chip ${active === k ? 'on' : ''}`}
            onClick={() => (k === 'wish' ? onOpenWishlist && onOpenWishlist() : setActive(k))}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="m-libgrid">
        {books.map((b, i) => (
          <div key={i} className="m-book" onClick={onOpenBook}>
            <Cover title={b.t} hue={HUES[b.i]} />
            <div
              className="tt"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {b.t}
            </div>
            <div className="au">{b.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Reader ----------------
function ReaderScreen({ onBack, onOpenChat, onNotify }) {
  const [bookmarked, setBookmarked] = useState(false);
  // Live session timer — counts time spent on the reader screen.
  // This is how the app actually measures 분: total minutes per
  // book = sum of all reader-screen sessions, paused when the app
  // backgrounds (visibilitychange) or the user leaves the reader.
  const [sessionSec, setSessionSec] = useState(0);
  React.useEffect(() => {
    let id,
      last = Date.now();
    const tick = () => {
      const now = Date.now();
      if (!document.hidden) setSessionSec((s) => s + (now - last) / 1000);
      last = now;
      id = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  const sMin = Math.floor(sessionSec / 60);
  const sSec = Math.floor(sessionSec % 60);

  const backWithSummary = () => {
    if (sessionSec >= 30) {
      onNotify && onNotify('이번 세션 ' + (sMin > 0 ? sMin + '분 ' : '') + sSec + '초 기록됨');
    }
    onBack && onBack();
  };

  return (
    <div data-screen-label="03 Reader">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={backWithSummary}>
          {Ic.back}
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>작별인사</div>
          <div className="m-session-timer">
            <span className="dot" />
            <span className="val">
              {sMin}:{String(sSec).padStart(2, '0')}
            </span>
          </div>
        </div>
        <button
          style={{ background: 'transparent', padding: 6 }}
          onClick={() => onNotify && onNotify('설정 메뉴는 곧 준비 중')}
        >
          {Ic.more}
        </button>
      </div>
      <div className="m-reader">
        <h3>오늘 읽은 부분</h3>
        <p>
          기억은 우리가 살아간 시간의 증거이지만, 동시에 우리가 살아가야 할 시간에 대한 약속이기도
          했다.
        </p>
        <p>
          <mark className="userline">
            아침의 첫 빛은 늘 같은 자리에서 들어왔다. 창문 너머의 세계는 어제와 다름없어 보였지만,
          </mark>
          그 빛 안에서 나는 매일 조금씩 다른 사람이 되어 있었다.
        </p>
        <p>
          그는 <mark className="hl">"좋은 문장은 마음에 닻을 내린다"</mark>고 말했다. 그 말이 오래
          남았다. 우리는 자주, 우리도 모르게, 그렇게 누군가의 문장 위에 정박해 살아간다.
        </p>
        <p>
          페이지를 넘기는 손끝의 온도, 종이의 결, 그리고 가끔씩 마주치는 단 한 줄. 그것이면
          충분했다.
        </p>
      </div>
      <div className="m-reader-toolbar">
        <button onClick={() => onNotify && onNotify('목차를 열었어요')}>{Ic.toc}</button>
        <button onClick={() => onNotify && onNotify('읽기 환경 패널이 곧 준비 중')}>
          {Ic.sun}
        </button>
        <button onClick={onOpenChat} style={{ color: 'var(--accent)' }}>
          {Ic.spark}
        </button>
        <button
          onClick={() => {
            setBookmarked((v) => !v);
            onNotify && onNotify(bookmarked ? '북마크를 해제했어요' : '이 페이지에 북마크');
          }}
          style={bookmarked ? { color: 'var(--accent)' } : {}}
        >
          {Ic.bookmark}
        </button>
      </div>
    </div>
  );
}

// ---------------- AI Chat ----------------
function ChatScreen({ onBack }) {
  // Mobile chat rooms work the same way as web: one room, one persona,
  // locked at creation. The header surfaces the persona + book in the
  // place where ChatGPT-style apps would put a model/title.
  const persona = { name: '소크라테스', role: '질문하는 사람', ico: 'help-circle' };
  const book = { t: '작별인사', sub: 'p.112' };
  return (
    <div data-screen-label="04 AI Chat">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {Ic.back}
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{persona.name}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-2)' }}>
            『{book.t}』 · {book.sub}
          </div>
        </div>
        <button style={{ background: 'transparent', padding: 6 }}>{Ic.more}</button>
      </div>
      <div className="m-chat-persona-bar">
        <span className="m-chat-persona-pill">
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          토론자 고정됨
        </span>
      </div>
      <div className="m-chat">
        <div className="row">
          <div className="av">AI</div>
          <div className="b">방금 읽으신 4장에서 가장 인상 깊었던 한 줄을 들려주실래요?</div>
        </div>
        <div className="row me">
          <div className="av">길</div>
          <div className="b">
            "좋은 문장은 마음에 닻을 내린다"는 문장이요. 마음에 오래 남았어요.
          </div>
        </div>
        <div className="row">
          <div className="av">AI</div>
          <div className="b">
            '닻'이라는 단어가 흥미로워요. 길동님께 닻이 되어준 다른 문장이나 책이 있나요? 그
            문장들에는 공통점이 있을까요?
          </div>
        </div>
        <div className="row me">
          <div className="av">길</div>
          <div className="b">생각해보면 다 누군가의 일상적인 말이었어요. 거창한 게 아니라.</div>
        </div>
      </div>
      <div className="m-chatinput">
        <input placeholder="작별인사에 대해 이야기해보세요…" />
        <button className="send">{Ic.send}</button>
      </div>
    </div>
  );
}

// ---------------- Capture ----------------
function CaptureScreen({ onBack, onSave }) {
  return (
    <div className="m-capture" data-screen-label="05 Capture">
      <div
        className="m-top"
        style={{ color: '#FDFBF7', position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        <button
          style={{ background: 'transparent', padding: 6, color: '#FDFBF7' }}
          onClick={onBack}
        >
          {Ic.back}
        </button>
        <div style={{ fontSize: 12, color: 'rgba(253,251,247,0.7)' }}>한 줄 담기</div>
        <button style={{ background: 'transparent', padding: 6, color: '#FDFBF7' }}>
          {Ic.flash}
        </button>
      </div>
      <div className="frame">
        <div className="page-quote">
          좋은 책을 읽는다는 것은 과거 몇 세기의
          <br />
          가장 훌륭한 사람들과 대화하는 것과 같다.
          <br />
          <span style={{ color: 'var(--fg-3)' }}>— 데카르트, 방법서설</span>
        </div>
        <div className="selection" />
      </div>
      <div className="ocr">
        <div className="lbl">인식된 문장</div>
        <div className="txt">
          "좋은 책을 읽는다는 것은 과거 몇 세기의 가장 훌륭한 사람들과 대화하는 것과 같다."
        </div>
      </div>
      <div className="ctrls">
        <button className="iconbtn">{Ic.flip}</button>
        <button className="shutter" />
        <button className="iconbtn" onClick={onSave}>
          {Ic.check}
        </button>
      </div>
    </div>
  );
}

// ---------------- Profile ----------------
function ProfileScreen({ onOpenSettings, onEditProfile, onOpenStats, onOpenQuotes }) {
  return (
    <div className="m-profile" data-screen-label="06 Profile">
      <div style={{ paddingTop: 16 }}>
        <div className="avatar-lg">홍</div>
        <div className="name">홍길동</div>
        <div className="bio">3년차 UI/UX 디자이너 · 종이책 애호가</div>
        <button
          onClick={onEditProfile}
          style={{
            marginTop: 12,
            padding: '7px 14px',
            borderRadius: 999,
            background: 'transparent',
            border: '1px solid var(--divider-strong)',
            color: 'var(--ink-800)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          프로필 수정
        </button>
      </div>
      <div className="m-stats">
        <div className="m-stat" onClick={onOpenStats} style={{ cursor: 'pointer' }}>
          <div className="v">47</div>
          <div className="l">완독</div>
        </div>
        <div className="m-stat" onClick={onOpenQuotes} style={{ cursor: 'pointer' }}>
          <div className="v">312</div>
          <div className="l">밑줄</div>
        </div>
        <div className="m-stat" onClick={onOpenStats} style={{ cursor: 'pointer' }}>
          <div className="v">14</div>
          <div className="l">연속일</div>
        </div>
      </div>
      <div className="m-row-list">
        {[
          [Ic.bm, '독서 기록', '47권 · 연속 14일', onOpenStats],
          [Ic.sun, '읽기 환경', '세리프 · 16pt · 종이톤', onOpenSettings],
          [Ic.spark, 'AI 독서토론', '토론자 4명 · 소크라테스', onOpenSettings],
          [Ic.cog, '설정', '', onOpenSettings],
        ].map(([ic, t, s, click], i) => (
          <div
            key={i}
            className="row"
            onClick={click || (() => {})}
            style={click ? { cursor: 'pointer' } : {}}
          >
            <div className="ic">{ic}</div>
            <div className="body">
              <div className="t">{t}</div>
              {s && <div className="s">{s}</div>}
            </div>
            {Ic.chev}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- App shell ----------------
function MobileApp({ initialTab, initialOverlay }) {
  const tabs = new Set(['home', 'library', 'profile']);
  const overlays = new Set([
    'reader',
    'chat',
    'capture',
    'book',
    'settings',
    'notifs',
    'search',
    'addbook',
    'login',
    'signup',
    'stats',
    'qdetail',
    'forgot',
    'pedit',
    'quotes',
    'wishlist',
  ]);
  const [tab, setTab] = useState(tabs.has(initialTab) ? initialTab : 'home');
  const [overlay, setOverlay] = useState(
    overlays.has(initialOverlay) ? initialOverlay : overlays.has(initialTab) ? initialTab : null,
  );
  // Personal-record only — no share state.
  const params = new URLSearchParams(location.search);
  const [toast, setToast] = useState('');
  const [share, setShare] = useState(null); // {mode, payload} | null
  const openShare = (mode, payload) => setShare({ mode, payload });
  const view = overlay || tab;

  // Auth screens: render full-bleed, no tabbar/FAB
  if (view === 'login') {
    return (
      <div className="m-app">
        <LoginScreen onSwitch={() => setOverlay('signup')} onForgot={() => setOverlay('forgot')} />
      </div>
    );
  }
  if (view === 'signup') {
    return (
      <div className="m-app">
        <SignupScreen onSwitch={() => setOverlay('login')} />
      </div>
    );
  }
  if (view === 'forgot') {
    return (
      <div className="m-app">
        <ForgotPasswordScreen onBack={() => setOverlay('login')} />
      </div>
    );
  }

  let body;
  if (view === 'home')
    body = (
      <HomeScreen
        onOpenReader={() => setOverlay('reader')}
        onOpenChat={() => setOverlay('chat')}
        onOpenCapture={() => setOverlay('capture')}
        onOpenStats={() => setOverlay('stats')}
        onOpenQuote={() => setOverlay('qdetail')}
        onOpenQuotes={() => setOverlay('quotes')}
      />
    );
  else if (view === 'library')
    body = (
      <LibraryScreen
        onOpenBook={() => setOverlay('book')}
        onOpenSearch={() => setOverlay('search')}
        onAddBook={() => setOverlay('addbook')}
        onOpenWishlist={() => setOverlay('wishlist')}
      />
    );
  else if (view === 'profile')
    body = (
      <ProfileScreen
        onOpenSettings={() => setOverlay('settings')}
        onEditProfile={() => setOverlay('pedit')}
        onOpenStats={() => setOverlay('stats')}
        onOpenQuotes={() => setOverlay('quotes')}
      />
    );
  else if (view === 'reader')
    body = (
      <ReaderScreen
        onBack={() => setOverlay(null)}
        onOpenChat={() => setOverlay('chat')}
        onNotify={setToast}
      />
    );
  else if (view === 'chat') body = <ChatScreen onBack={() => setOverlay(null)} />;
  else if (view === 'capture')
    body = (
      <CaptureScreen
        onBack={() => setOverlay(null)}
        onSave={() => {
          setToast('한 줄을 담았어요');
          setOverlay(null);
        }}
      />
    );
  else if (view === 'book')
    body = (
      <BookDetailScreen
        onBack={() => setOverlay(null)}
        onOpenChat={() => setOverlay('chat')}
        onOpenReader={() => setOverlay('reader')}
        onOpenQuote={() => setOverlay('qdetail')}
        onShare={() =>
          openShare('book', {
            t: '작별인사',
            a: '김영하',
            bg: 'linear-gradient(155deg,#1F2A1B,#4A6741)',
          })
        }
        onNotify={setToast}
      />
    );
  else if (view === 'settings')
    body = (
      <SettingsScreen
        onBack={() => setOverlay(null)}
        onEditProfile={() => setOverlay('pedit')}
        onNotify={setToast}
      />
    );
  else if (view === 'notifs') body = <NotificationsScreen onBack={() => setOverlay(null)} />;
  else if (view === 'search')
    body = (
      <SearchScreen
        onBack={() => setOverlay(null)}
        onOpenBook={() => setOverlay('book')}
        onOpenQuote={() => setOverlay('qdetail')}
      />
    );
  else if (view === 'addbook') body = <BookSearchScreen onBack={() => setOverlay(null)} />;
  else if (view === 'stats') body = <StatsScreen onBack={() => setOverlay(null)} />;
  else if (view === 'qdetail')
    body = (
      <QuoteDetailScreen
        onBack={() => setOverlay(null)}
        onShare={() =>
          openShare('quote', {
            t: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
            a: '김연수',
            b: '일곱 해의 마지막',
            p: 'p.42',
          })
        }
        onNotify={setToast}
      />
    );
  else if (view === 'pedit') body = <ProfileEditScreen onBack={() => setOverlay(null)} />;
  else if (view === 'quotes')
    body = (
      <QuotesListScreen onBack={() => setOverlay(null)} onOpenQuote={() => setOverlay('qdetail')} />
    );
  else if (view === 'wishlist')
    body = (
      <WishlistScreen
        onBack={() => setOverlay(null)}
        onOpenBook={() => setOverlay('book')}
        onAddBook={() => setOverlay('addbook')}
        onNotify={setToast}
      />
    );

  return (
    <div className="m-app">
      {body}

      {!overlay && tab !== 'capture' && (
        <button className="m-fab" onClick={() => setOverlay('capture')}>
          {Ic.plus}
        </button>
      )}

      <nav className="m-tabbar">
        <button
          className={tab === 'home' ? 'active' : ''}
          onClick={() => {
            setTab('home');
            setOverlay(null);
          }}
        >
          {Ic.home}
          <span>홈</span>
        </button>
        <button
          className={tab === 'library' ? 'active' : ''}
          onClick={() => {
            setTab('library');
            setOverlay(null);
          }}
        >
          {Ic.library}
          <span>서재</span>
        </button>
        <button className={overlay === 'chat' ? 'active' : ''} onClick={() => setOverlay('chat')}>
          {Ic.spark}
          <span>AI</span>
        </button>
        <button
          className={overlay === 'capture' ? 'active' : ''}
          onClick={() => setOverlay('capture')}
        >
          {Ic.cam}
          <span>캡처</span>
        </button>
        <button
          className={tab === 'profile' ? 'active' : ''}
          onClick={() => {
            setTab('profile');
            setOverlay(null);
          }}
        >
          {Ic.user}
          <span>나</span>
        </button>
      </nav>

      <MToast text={toast} onDone={() => setToast('')} />
      <ShareSheet
        open={!!share}
        mode={share && share.mode}
        payload={share && share.payload}
        onClose={() => setShare(null)}
      />
    </div>
  );
}

Object.assign(window, { MobileApp });
