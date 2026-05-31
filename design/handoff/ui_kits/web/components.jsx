// Chaekdam web UI kit — components
// All Korean copy is intentional; reading service for Korean readers.

const { useState } = React;

const Icon = ({ name, ...rest }) => <i data-lucide={name} {...rest}></i>;

function Sidebar({ tab, setTab, onEditProfile }) {
  const nav = [
    { id: 'home', label: '홈', icon: 'home' },
    { id: 'library', label: '내 서재', icon: 'library' },
    { id: 'wish', label: '읽고 싶은', icon: 'bookmark' },
    { id: 'reader', label: '읽는 중', icon: 'book-open' },
    { id: 'quotes', label: '밑줄 모음', icon: 'quote' },
    { id: 'talk', label: 'AI 독서토론', icon: 'messages-square' },
  ];
  const lower = [
    { id: 'stats', label: '독서 기록', icon: 'chart-line' },
    { id: 'settings', label: '설정', icon: 'settings' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="wm">책담</div>
        <div className="tag">Chaekdam</div>
      </div>
      <nav className="nav">
        {nav.map((n) => (
          <button
            key={n.id}
            className={'nav-item ' + (tab === n.id ? 'active' : '')}
            onClick={() => setTab(n.id)}
          >
            <Icon name={n.icon} className="icon" />
            <span>{n.label}</span>
          </button>
        ))}
        <div className="nav-section">기록</div>
        {lower.map((n) => (
          <button
            key={n.id}
            className={'nav-item ' + (tab === n.id ? 'active' : '')}
            onClick={() => setTab(n.id)}
          >
            <Icon name={n.icon} className="icon" />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={onEditProfile}
        title="프로필 수정"
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 10,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--terra-100)',
            color: 'var(--terra-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          홍
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>홍길동</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>오늘 24분 읽음</div>
        </div>
      </button>
    </aside>
  );
}

function TopBar({ title, subtitle, primary, onPrimary, primaryIcon, extra }) {
  return (
    <div className="top">
      <div>
        <h1>
          {title}
          <small>{subtitle}</small>
        </h1>
      </div>
      <div className="top-actions">
        {extra}
        <div className="search">
          <Icon name="search" className="icon icon-sm" />
          <input placeholder="책, 작가, 밑줄 검색" />
        </div>
        {primary && (
          <button className="btn btn-primary" onClick={onPrimary}>
            <Icon name={primaryIcon || 'pen-line'} className="icon icon-sm" />
            {primary}
          </button>
        )}
      </div>
    </div>
  );
}

// ───── Books ─────
// Naver Books API gives us: title, author, publisher, pubdate, isbn,
// image, description. It does NOT give total page count or table of
// contents — so any "234/344쪽" or chapter list in this UI would be
// fabricated. We track only what the app actually owns + what the
// user types in: status, bookmark (current page, no total), star
// rating, reading format, personal tags, sessions, dates, captured
// quotes.
const COVERS = [
  {
    t: '일곱 해의 마지막',
    a: '김연수',
    bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
    status: 'reading',
    bookmark: 234, // 사용자 북마크 페이지 (총량 없으니 %는 못 보여줌)
    format: '종이책',
    tags: ['#한국문학', '#백석'],
    startedAt: '5월 14일',
    lastActive: '오늘 한 줄 담음',
    sessions: 12,
    quotes: 14,
  },
  {
    t: '아주 사적인 독서',
    a: '이현우',
    bg: 'linear-gradient(155deg,#6B8C5F,#4A6741)',
    status: 'done',
    rating: 4.5, // 완독 후 사용자 별점
    review: '천천히, 두 번 읽고 싶은 책.',
    format: '전자책',
    tags: ['#에세이', '#문장수집'],
    startedAt: '4월 12일',
    finishedAt: '5월 7일',
    sessions: 8,
    quotes: 22,
  },
  {
    t: '사서함 110호의 우편물',
    a: '이도우',
    bg: 'linear-gradient(155deg,#45403A,#1F1A15)',
    status: 'reading',
    bookmark: 48,
    format: '종이책',
    tags: ['#소설'],
    startedAt: '어제',
    lastActive: '어제 세션',
    sessions: 1,
    quotes: 0,
  },
  {
    t: '문구의 모험',
    a: '고로다 슈이치',
    bg: 'linear-gradient(155deg,#D9963D,#86571B)',
    status: 'reading',
    bookmark: 128,
    format: '종이책',
    tags: ['#에세이', '#취향'],
    startedAt: '4월 30일',
    sessions: 7,
    quotes: 9,
  },
  {
    t: '바깥은 여름',
    a: '김애란',
    bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
    status: 'done',
    rating: 5,
    review: '한 문장씩, 오래.',
    format: '종이책',
    tags: ['#한국문학', '#단편'],
    startedAt: '3월 10일',
    finishedAt: '4월 22일',
    sessions: 11,
    quotes: 26,
  },
  {
    t: '여행의 이유',
    a: '김영하',
    bg: 'linear-gradient(155deg,#6F684A,#3A2F1A)',
    status: 'wish',
    format: '전자책',
    tags: ['#에세이'],
    startedAt: '5월 11일',
  },
  {
    t: '슬픔을 공부하는 슬픔',
    a: '신형철',
    bg: 'linear-gradient(155deg,#6F4E7C,#3E2B47)',
    status: 'paused',
    bookmark: 92,
    format: '종이책',
    tags: ['#평론'],
    startedAt: '2월 18일',
    lastActive: '3월 8일 마지막 활동',
  },
];

const STATUS_LABEL = { reading: '읽는 중', done: '완독', wish: '읽고 싶은', paused: '쉬는 중' };

// Status badge — design system component (see colors_and_type.css § Status Badge).
// Four colour families, four labels. Optional `solid` variant for selected state.
function StatusBadge({ status = 'reading', size = 'md', solid = false }) {
  const cls = ['status-badge', 'is-' + status];
  if (size === 'sm') cls.push('sm');
  if (solid) cls.push('solid');
  return <span className={cls.join(' ')}>{STATUS_LABEL[status] || status}</span>;
}

// Format the meta line shown beside the status badge on a BookCard.
// Different statuses surface different user-entered values. We do NOT
// show '오늘 28분 읽음' style auto-measured minutes — the app can't
// reliably time a paper-book reader. We surface session counts and
// last-activity instead (capture/AI talk/bookmark update).
function bookMetaLine(b) {
  if (b.status === 'done') {
    const stars = b.rating ? '★ ' + b.rating.toFixed(1) : '';
    return [stars, b.finishedAt ? b.finishedAt + ' 완독' : null].filter(Boolean).join(' · ');
  }
  if (b.status === 'wish') return b.startedAt ? b.startedAt + ' 담음' : '읽고 싶은 책';
  if (b.status === 'paused') return '쉬는 중 · ' + (b.startedAt || '');
  // reading
  const bm = b.bookmark ? '현재 p.' + b.bookmark : null;
  const last = b.lastActive || (b.lastSession ? b.lastSession : null);
  return [bm, last].filter(Boolean).join(' · ') || b.startedAt || '';
}

function BookCard({ b, onOpen }) {
  const status = b.status || 'reading';
  return (
    <div className="book-card" onClick={onOpen}>
      <div className="book-cover" style={{ background: b.bg }}>
        {b.t}
      </div>
      <div className="book-meta">
        <div className="title">{b.t}</div>
        <div className="author">{b.a}</div>
        <div className="book-status">
          <span className={'status-badge sm is-' + status}>
            {STATUS_LABEL[status] || '읽는 중'}
          </span>
          <span className="meta-line">{bookMetaLine(b)}</span>
        </div>
      </div>
    </div>
  );
}

// ───── Quotes ─────
const QUOTES = [
  {
    t: '아주 천천히 책장을 넘기는 사람만이 <mark>어떤 문장이 자신의 것인지</mark> 알아본다.',
    a: '김연수',
    b: '일곱 해의 마지막',
    p: 'p.42',
    likes: 12,
  },
  {
    t: '독서는 결국 자기 자신과의 가장 오래된 대화이고, 가장 천천히 답이 도착하는 편지이다.',
    a: '이현우',
    b: '아주 사적인 독서',
    p: 'p.118',
    likes: 8,
  },
  {
    t: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다. <mark>읽는 동안에는 너무 가벼웠다.</mark>',
    a: '김애란',
    b: '바깥은 여름',
    p: 'p.94',
    likes: 21,
  },
];

function QuoteCard({ q, onMenu }) {
  // Personal-record only — no hearts, no share. Just the line, the
  // attribution, and a more-menu for housekeeping (edit / pin / move /
  // delete).
  const handleMenu = (e) => {
    e.stopPropagation();
    onMenu && onMenu(e.currentTarget, q);
  };
  return (
    <article className="quote-card">
      <div className="q-text" dangerouslySetInnerHTML={{ __html: q.t }} />
      <div className="q-meta">
        <div>
          <b>{q.a}</b>{' '}
          <span className="author">
            · {q.b} · {q.p}
          </span>
        </div>
        <div className="q-actions">
          <button onClick={handleMenu} aria-label="더보기">
            <Icon name="more-horizontal" className="icon icon-sm" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ───── Reading log — monthly calendar with prev/next ─────
const WEB_TODAY = { y: 2025, m: 11, d: 18 };
const WEB_LOG = {
  '2025-08': new Set([1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 17, 18, 19, 22, 23, 25, 26, 28, 29]),
  '2025-09': new Set([1, 2, 4, 5, 6, 9, 10, 11, 12, 15, 18, 19, 20, 22, 25, 27, 28, 30]),
  '2025-10': new Set([
    2, 3, 4, 5, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 24, 25, 28, 29, 30, 31,
  ]),
  '2025-11': new Set([1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]),
};
const KO_MONTHS = [
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

function ReadingLogWide() {
  const [cur, setCur] = useState({ y: WEB_TODAY.y, m: WEB_TODAY.m });
  const key = `${cur.y}-${String(cur.m).padStart(2, '0')}`;
  const readDays = WEB_LOG[key] || new Set();
  const daysInMonth = new Date(cur.y, cur.m, 0).getDate();
  const firstDow = new Date(cur.y, cur.m - 1, 1).getDay();
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  const isCurrentMonth = cur.y === WEB_TODAY.y && cur.m === WEB_TODAY.m;
  const isPastMonth = cur.y < WEB_TODAY.y || (cur.y === WEB_TODAY.y && cur.m < WEB_TODAY.m);

  const keyOf = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
  const prevKey = cur.m === 1 ? keyOf(cur.y - 1, 12) : keyOf(cur.y, cur.m - 1);
  const nextKey = cur.m === 12 ? keyOf(cur.y + 1, 1) : keyOf(cur.y, cur.m + 1);
  const hasPrev = !!WEB_LOG[prevKey];
  const hasNext = !!WEB_LOG[nextKey];

  const goPrev = () =>
    hasPrev && setCur(cur.m === 1 ? { y: cur.y - 1, m: 12 } : { y: cur.y, m: cur.m - 1 });
  const goNext = () =>
    hasNext && setCur(cur.m === 12 ? { y: cur.y + 1, m: 1 } : { y: cur.y, m: cur.m + 1 });

  const pctOfMonth = Math.round((readDays.size / daysInMonth) * 100);
  const minutes = readDays.size * 24; // ~24 min/day mock
  const quotesM = Math.round(readDays.size * 0.7); // ~0.7 quote/day captured

  return (
    <div className="rlog">
      <div className="rlog-cal-wrap">
        <div className="rlog-head">
          <div>
            <div className="rlog-eyebrow">독서 기록</div>
            <div className="rlog-title">
              {cur.y}년 {KO_MONTHS[cur.m - 1]}
            </div>
          </div>
          <div className="rlog-nav">
            <button
              className="rlog-nav-btn"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="이전 달"
            >
              ‹
            </button>
            <button
              className="rlog-nav-btn"
              onClick={goNext}
              disabled={!hasNext}
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
        </div>

        <div className="rlog-dow">
          {dows.map((d, i) => (
            <span key={d} className={i === 0 ? 'is-sun' : ''}>
              {d}
            </span>
          ))}
        </div>

        <div className="rlog-cal">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`b${i}`} className="cd is-blank" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dow = (firstDow + i) % 7;
            const isRead = readDays.has(day);
            const isToday = isCurrentMonth && day === WEB_TODAY.d;
            const isFuture = isCurrentMonth && day > WEB_TODAY.d;
            const cls = ['cd'];
            if (isRead) cls.push('is-read');
            if (isFuture) cls.push('is-future');
            if (isToday) cls.push('is-today');
            if (dow === 0) cls.push('is-sun');
            return (
              <div key={day} className={cls.join(' ')}>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rlog-side">
        <div className="rlog-bigstat">
          <div>
            <span className="num">{readDays.size}</span>
            <span className="unit">일</span>
          </div>
          <div className="lbl">
            {isCurrentMonth
              ? '이번 달 읽은 날'
              : isPastMonth
                ? '읽은 날 · ' + pctOfMonth + '%'
                : '아직 기록 없음'}
          </div>
        </div>

        <div className="rlog-statgrid">
          <div className="rlog-stat">
            <div className="v">
              14<small>일</small>
            </div>
            <div className="l">현재 연속</div>
          </div>
          <div className="rlog-stat">
            <div className="v">
              {Math.floor(minutes / 60)}
              <small>시간 {minutes % 60}분</small>
            </div>
            <div className="l">총 독서 시간</div>
          </div>
          <div className="rlog-stat">
            <div className="v">
              {quotesM}
              <small>개</small>
            </div>
            <div className="l">담은 한 줄</div>
          </div>
          <div className="rlog-stat">
            <div className="v">
              3<small>권</small>
            </div>
            <div className="l">완독한 책</div>
          </div>
        </div>

        <div className="rlog-legend">
          <span>
            <span className="sw r" />
            읽음
          </span>
          <span>
            <span className="sw u" />
            미독
          </span>
          <span>
            <span className="sw t" />
            오늘
          </span>
        </div>
      </div>
    </div>
  );
}

function StreakCard() {
  return <ReadingLogWide />;
}

// ───── Wishlist ─────
// Replaces the old RecCard. No algorithm — surfaces books the user
// already saved to the wish list, ordered by most-recently-added.
// Falls back to an empty state CTA when nothing's been saved.
const WISHLIST = [
  {
    t: '여행의 이유',
    a: '김영하',
    bg: 'linear-gradient(155deg,#6F684A,#3A2F1A)',
    addedAt: '5월 11일',
    note: '오래 비행기 안에서 다시 읽고 싶어서.',
  },
  {
    t: '아침의 피아노',
    a: '김진영',
    bg: 'linear-gradient(155deg,#6B8C5F,#4A6741)',
    addedAt: '5월 3일',
    note: '서점에서 첫 문장만 읽고 멈췄던 책.',
  },
  { t: '읽다', a: '김영하', bg: 'linear-gradient(155deg,#1F1A15,#45403A)', addedAt: '4월 28일' },
  {
    t: '슬픔을 공부하는 슬픔',
    a: '신형철',
    bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
    addedAt: '4월 14일',
    note: '추천 받음 — 천천히.',
  },
  {
    t: '소설가의 일',
    a: '김연수',
    bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
    addedAt: '3월 22일',
  },
  {
    t: '문학을 읽는다는 것은',
    a: '테리 이글턴',
    bg: 'linear-gradient(155deg,#86571B,#3A2810)',
    addedAt: '2월 6일',
    note: '두 번째 시도.',
  },
];

function WishlistCard({ openAddBook, setTab }) {
  // Show up to 3 most-recently-added wish items in the home rail.
  const items = WISHLIST.slice(0, 3);
  const empty = items.length === 0;
  return (
    <div className="rail-card wish-card">
      <div className="wish-card-head">
        <h3>읽고 싶은 책</h3>
        {!empty && (
          <a
            href="#"
            className="wish-more"
            onClick={(e) => {
              e.preventDefault();
              setTab && setTab('wish');
            }}
          >
            전체 보기 →
          </a>
        )}
      </div>
      {empty ? (
        <div className="wish-empty wish-empty-card">
          <div className="wish-empty-ico">
            <Icon name="bookmark-plus" className="icon" />
          </div>
          <div className="wish-empty-t">아직 담아둔 책이 없어요</div>
          <div className="wish-empty-s">
            관심 가는 책을 미리 담아두면, 다음 읽을 책이 비어 보이지 않아요.
          </div>
          <button
            className="btn btn-primary wish-empty-cta"
            onClick={() => openAddBook && openAddBook()}
          >
            <Icon name="plus" className="icon icon-sm" />책 담으러 가기
          </button>
        </div>
      ) : (
        <>
          {items.map((r, i) => (
            <div className="rec-row wish-row" key={i}>
              <div className="rec-cover" style={{ background: r.bg }}></div>
              <div className="rec-info">
                <div className="t">{r.t}</div>
                <div className="a">
                  {r.a} · {r.addedAt} 담음
                </div>
              </div>
              <button className="btn btn-ghost wish-row-action" title="지금부터 읽기">
                <Icon name="book-open" className="icon icon-sm" />
              </button>
            </div>
          ))}
          <button className="wish-card-foot" onClick={() => openAddBook && openAddBook()}>
            <Icon name="plus" className="icon icon-sm" />책 더 담기
          </button>
        </>
      )}
    </div>
  );
}
// Back-compat alias — older code may still import `RecCard`.
const RecCard = WishlistCard;

// ───── Reader pane + AI chat ─────
function ReaderPane({ book, empty }) {
  // We do NOT have a chapter list (Naver Books doesn't return TOC), so
  // there's no canonical "3장" to show. The eyebrow shows what we DO
  // own: the user's last reading session date + book title.
  // When `empty`, the user hasn't captured any quotes for this book yet
  // — render a quiet empty state with a clear "한 줄 담기" affordance
  // instead of fabricating content.
  const title = (book && book.t) || '일곱 해의 마지막';
  if (empty) {
    return (
      <div className="reader-pane reader-pane-empty">
        <div className="reader-empty-eyebrow">오늘 11월 18일 · {title}</div>
        <div className="reader-empty-art">
          <svg viewBox="0 0 80 80" className="icon" aria-hidden="true">
            <path d="M16 14 H64 V66 H16 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M24 26 H56 M24 34 H56 M24 42 H48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M50 50 L62 50 L66 54 L62 58 L50 58"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="62" cy="54" r="2" fill="currentColor" />
          </svg>
        </div>
        <h3 className="reader-empty-title">이 책에 담은 한 줄이 없어요</h3>
        <p className="reader-empty-sub">
          마음에 닿은 문장을 만나면 사진으로 담아주세요. 책담이 글자를 읽어 여기에 모아둘게요.
        </p>
        <div className="reader-empty-actions">
          <button className="btn btn-primary">
            <Icon name="camera" className="icon icon-sm" />
            사진으로 한 줄 담기
          </button>
          <button className="btn btn-secondary">
            <Icon name="pen-line" className="icon icon-sm" />
            직접 입력
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="reader-pane">
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 8,
        }}
      >
        오늘 11월 18일 · {title}
      </div>
      <h3>겨울의 끝에서</h3>
      <p>
        기행은 백석의 시를 다시 외우기 시작했다. 그 겨울의 끝자락, 입김이 길게 늘어지는 새벽에 그는
        마치 누군가에게 들려주려는 것처럼 조용히 입을 움직였다.
      </p>
      <p>
        <mark className="userline">
          아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.
        </mark>{' '}
        기행은 그 문장을 자기 것으로 만들고 싶었지만, 그 문장은 이미 너무 오래 다른 사람의 것이었다.
      </p>
      <p>
        그는 한참을 그렇게 앉아 있었다. <mark className="hl">조용한 장면이 크게 들렸다.</mark>{' '}
        멀리서 기차 소리가 들렸고, 그 소리는 마치 그가 외우던 시의 운율과 닮아 있었다.
      </p>
    </div>
  );
}

// ───── AI Personas ─────
// Shared between settings (default picker), NewChatDialog (per-room
// picker), and ChatPanel (the locked badge on top of the chat).
// Each room has ONE persona, fixed at room-creation — that's why we
// surface this list in three places but keep the source single.
const PERSONAS = {
  socrates: {
    name: '소크라테스',
    role: '질문하는 사람',
    ico: 'help-circle',
    short: '답 대신 질문을 건네요',
  },
  critic: {
    name: '비평가',
    role: '분석하는 사람',
    ico: 'scan-text',
    short: '구조와 문체를 짚어줘요',
  },
  author: {
    name: '작가 본인',
    role: '쓴 사람의 목소리',
    ico: 'feather',
    short: '인터뷰·서신에서 학습',
    onlyDeceased: true,
  },
  friend: {
    name: '책 동무',
    role: '같이 읽는 친구',
    ico: 'coffee',
    short: '분석하지 않고 같이 반응해요',
  },
};

function ChatPanel({ persona = 'socrates', book = { t: '일곱 해의 마지막' }, empty }) {
  const p = PERSONAS[persona] || PERSONAS.socrates;
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState([
    { who: 'ai', body: '이 책에서 가장 마음에 닿은 장면은 어디였나요?' },
    {
      who: 'me',
      body: '기행이 백석의 시를 다시 외우는 장면이요. 너무 조용해서 오히려 크게 들렸어요.',
    },
    {
      who: 'ai',
      body: '"조용한 장면이 크게 들렸다"는 표현, 좋네요. 그 장면에서 기행은 어떤 마음이었을까요?',
    },
  ]);
  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { who: 'me', body: text }]);
    setText('');
    setTimeout(
      () =>
        setMsgs((m) => [
          ...m,
          { who: 'ai', body: '그 마음을 한 문장으로 적어둔다면 어떻게 표현해 보고 싶으세요?' },
        ]),
      600,
    );
  };
  if (empty) {
    return (
      <div className="chat chat-empty">
        <div className="chat-empty-art">
          <Icon name="message-circle-dashed" className="icon" />
        </div>
        <h3 className="chat-empty-title">아직 시작한 대화가 없어요</h3>
        <p className="chat-empty-sub">
          『{book.t}』에 대해 함께 이야기할 토론자를 골라 새 대화방을 만들어보세요. 한 책에 여러
          방을 둘 수 있어요.
        </p>
        <button className="btn btn-primary chat-empty-cta">
          <Icon name="plus" className="icon icon-sm" />
          토론자 고르고 시작
        </button>
        <div className="chat-empty-personas">
          {Object.entries(PERSONAS).map(([k, pp]) => (
            <span key={k} className="chat-empty-persona-chip">
              <Icon name={pp.ico} className="icon" />
              {pp.name}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="chat">
      <div className="chat-head">
        <div className="chat-head-avatar">
          <Icon name={p.ico} className="icon" />
        </div>
        <div className="chat-head-id">
          <div className="chat-head-row">
            <span className="chat-head-name">{p.name}</span>
            <span className="chat-head-lock" title="대화방을 시작한 뒤에는 토론자를 바꿀 수 없어요">
              <Icon name="lock" className="icon" />
              고정됨
            </span>
          </div>
          <div className="chat-head-sub">
            『{book.t}』 · {p.role}
          </div>
        </div>
      </div>
      <div className="chat-body">
        <div className="suggest">
          <Icon name="sparkles" className="icon icon-sm" style={{ marginTop: 2 }} />
          <div>
            방금 밑줄 그은 문장으로 <b>대화를 시작해 볼까요?</b>
          </div>
        </div>
        {msgs.map((m, i) => (
          <div key={i} className={'bubble-row ' + (m.who === 'me' ? 'me' : '')}>
            <div className="bubble-av">{m.who === 'me' ? '나' : 'AI'}</div>
            <div className="bubble">{m.body}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          placeholder="생각을 적어보세요…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="send" onClick={send}>
          <Icon name="arrow-up" className="icon icon-sm" />
        </button>
      </div>
    </div>
  );
}

// ───── Capture / Upload dialog ─────
// Two entry paths: shoot a photo, or upload an image. After an image
// arrives we pretend OCR ran and show the extracted line for review.
function CaptureDialog({ open, onClose }) {
  const [img, setImg] = React.useState(null);
  const [drag, setDrag] = React.useState(false);
  const fileRef = React.useRef(null);
  const camRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setImg(null);
      setDrag(false);
      lucide.createIcons();
    }
  }, [open]);

  const onFile = (f) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImg(url);
  };
  const onPick = (e) => onFile(e.target.files && e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    onFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  if (!open) return null;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">한 줄 담기</div>
            <h2 className="modal-title">{img ? '문장 확인' : '문구 촬영 또는 이미지 업로드'}</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
            <Icon name="x" className="icon" />
          </button>
        </div>

        {!img && (
          <>
            <div className="capture-paths">
              <button className="path" onClick={() => camRef.current && camRef.current.click()}>
                <div className="ico">
                  <Icon name="camera" className="icon" />
                </div>
                <div className="tt">사진 촬영</div>
                <div className="sub">카메라로 책장을 찍어서 한 줄 추출</div>
              </button>
              <button className="path" onClick={() => fileRef.current && fileRef.current.click()}>
                <div className="ico">
                  <Icon name="image-up" className="icon" />
                </div>
                <div className="tt">이미지 업로드</div>
                <div className="sub">갤러리에 있는 사진을 불러와 소</div>
              </button>
            </div>

            <div
              className={'dropzone ' + (drag ? 'is-drag' : '')}
              onDragEnter={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <Icon
                name="upload-cloud"
                className="icon"
                style={{ width: 28, height: 28, color: 'var(--ink-500)' }}
              />
              <div className="dz-t">이미지를 여기로 끌어다 놓아도 돼요</div>
              <div className="dz-s">JPG · PNG · HEIC · 최대 12MB</div>
            </div>

            <input
              ref={camRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={onPick}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onPick}
            />
          </>
        )}

        {img && (
          <div className="capture-review">
            <div className="cr-photo">
              <img src={img} alt="캡처 이미지" />
              <button
                className="btn btn-icon btn-ghost cr-retake"
                onClick={() => setImg(null)}
                title="다시 고르기"
              >
                <Icon name="refresh-cw" className="icon icon-sm" />
              </button>
            </div>
            <div className="cr-side">
              <div className="cr-ocr">
                <div className="cr-lbl">인식된 문장</div>
                <div className="cr-text" contentEditable suppressContentEditableWarning>
                  아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.
                </div>
              </div>
              <div className="cr-fields">
                <label>
                  <span>책</span>
                  <select className="sel">
                    <option>일곱 해의 마지막 · 김연수</option>
                    <option>아주 사적인 독서 · 이현우</option>
                    <option>바깥은 여름 · 김애란</option>
                  </select>
                </label>
                <label>
                  <span>페이지</span>
                  <input className="input" defaultValue="42" />
                </label>
                <label>
                  <span>태그</span>
                  <input className="input" placeholder="#소설  #문장수집" />
                </label>
              </div>
            </div>
            <div className="cr-actions">
              <button className="btn btn-ghost" onClick={() => setImg(null)}>
                다시 고르기
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                나중에 정리
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                <Icon name="check" className="icon icon-sm" />한 줄 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───── Hero ─────
function Hero({ onCapture, onContinue }) {
  return (
    <div className="hero">
      <div>
        <div className="eyebrow">오늘의 한 줄</div>
        <h2>
          읽기는 결국 <span className="mark-underline">자신을 발견하는</span> 일.
          <br />
          오늘은 어디까지 닿았나요?
        </h2>
        <p>읽고 있던 페이지로 돌아가거나, 어제 그은 문장을 다시 읽어볼 수 있어요.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onContinue}>
            <Icon name="book-open" className="icon icon-sm" />
            이어 읽기
          </button>
          <button className="btn btn-secondary" onClick={onCapture}>
            <Icon name="camera" className="icon icon-sm" />
            문구 촬영
          </button>
          <button className="btn btn-secondary" onClick={onCapture}>
            <Icon name="image-up" className="icon icon-sm" />
            이미지 업로드
          </button>
        </div>
      </div>
      <div className="hero-stat">
        <div className="big">24</div>
        <div className="lbl">오늘 읽은 분</div>
        <div className="delta">▲ 어제보다 6분</div>
      </div>
    </div>
  );
}

// ───── Pages ─────
function PageHome({ openBook, openCapture, openShareQuote, openQmenu, openAddBook, setTab }) {
  return (
    <>
      <TopBar
        title="안녕하세요, 길동님"
        subtitle="어제까지 12권 · 이번 달 3권 완독했어요"
        primary="한 줄 담기"
        primaryIcon="camera"
        onPrimary={openCapture}
      />
      <Hero onCapture={openCapture} onContinue={() => setTab('reader')} />
      <ReadingLogWide />
      <div className="h-section">
        <h2>읽는 중</h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab('library');
          }}
        >
          전체 보기 →
        </a>
      </div>
      <div className="row-grid">
        {COVERS.slice(0, 4).map((b, i) => (
          <BookCard key={i} b={b} onOpen={() => openBook(b)} />
        ))}
      </div>
      <div className="col-grid" style={{ marginTop: 36 }}>
        <div>
          <div className="h-section" style={{ marginTop: 0 }}>
            <h2>최근 밑줄</h2>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setTab('quotes');
              }}
            >
              전체 보기 →
            </a>
          </div>
          {QUOTES.slice(0, 2).map((q, i) => (
            <QuoteCard key={i} q={q} onMenu={(anchor, qq) => openQmenu(anchor, qq)} />
          ))}
        </div>
        <div>
          <WishlistCard openAddBook={openAddBook} setTab={setTab} />
        </div>
      </div>
    </>
  );
}

function PageLibrary({ openBook, openAddBook }) {
  const onOpenBook = openBook;
  const onAddBook = openAddBook;
  const [filter, setFilter] = useState('전체');
  const filters = ['전체', '읽는 중', '완독', '읽고 싶은', '밑줄만'];
  return (
    <>
      <TopBar
        title="내 서재"
        subtitle="총 27권 · 이번 해 14권 완독"
        primary="책 추가"
        primaryIcon="plus"
        onPrimary={onAddBook}
      />
      <div className="lib-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={'chip ' + (filter === f ? 'is-active' : '')}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="row-grid">
        {COVERS.map((b, i) => (
          <BookCard key={i} b={b} onOpen={() => onOpenBook(b)} />
        ))}
      </div>
    </>
  );
}

// Session control — start / pause / stop. The reader screen is where
// '분' metrics are recorded for the app, and the user wants explicit
// control rather than a timer that silently auto-runs. Three states:
//   idle    — nothing recording yet; one "기록 시작" affordance
//   running — live timer + pause + stop
//   paused  — frozen timer + resume + stop
// The timer freezes its accumulated seconds whenever it's not actively
// running; visibilitychange behaviour from the old version is kept,
// so backgrounding the tab acts like a pause.
function SessionTimer() {
  const [secs, setSecs] = useState(0);
  const [state, setState] = useState('idle'); // 'idle' | 'running' | 'paused'
  // Refs let the tick loop read the latest state without rebinding.
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Lucide swaps <i data-lucide> placeholders for inline SVGs once on
  // mount of the parent app. When this timer changes state we emit a
  // different set of icons (play/pause/stop), so we re-run the swap
  // locally — otherwise the new buttons appear as empty squares.
  React.useEffect(() => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, [state]);

  React.useEffect(() => {
    if (state !== 'running') return;
    let raf,
      last = performance.now();
    const tick = () => {
      const now = performance.now();
      if (!document.hidden && stateRef.current === 'running') {
        setSecs((s) => s + (now - last) / 1000);
      }
      last = now;
      raf = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(raf);
  }, [state]);

  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const mmss = `${m}:${String(s).padStart(2, '0')}`;

  if (state === 'idle') {
    return (
      <button
        className="session-timer session-timer-idle"
        onClick={() => setState('running')}
        title="이 책을 읽기 시작했어요"
      >
        <Icon name="play" className="icon icon-sm" />
        <span className="lbl">기록 시작</span>
      </button>
    );
  }
  return (
    <span className={'session-timer is-' + state} title="이번 세션 시간">
      <span className="dot" />
      <span className="lbl">이번 세션</span>
      <span className="val">{mmss}</span>
      <span className="session-timer-divider" />
      <button
        className="session-timer-btn"
        onClick={() => setState(state === 'running' ? 'paused' : 'running')}
        title={state === 'running' ? '일시 중지' : '이어서 기록'}
        aria-label={state === 'running' ? '일시 중지' : '이어서 기록'}
      >
        <Icon name={state === 'running' ? 'pause' : 'play'} className="icon icon-sm" />
      </button>
      <button
        className="session-timer-btn"
        onClick={() => {
          setState('idle');
          setSecs(0);
        }}
        title="기록 끝내기"
        aria-label="기록 끝내기"
      >
        <Icon name="square" className="icon icon-sm" />
      </button>
    </span>
  );
}

// ───── Reader book switcher ─────
// Users read multiple books in parallel, so the reader screen needs a
// way to swap which book they're currently sitting with. Click the book
// pill in the TopBar to open a popover of all 읽는 중 books with their
// last bookmark and last activity. The currently-reading list comes
// straight from COVERS filtered by status; in production this would be
// the user's library reading shelf.
function ReaderBookSwitcher({ book, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  // Close on outside click. We listen on mousedown so clicking inside the
  // popover doesn't toggle while the user picks a book.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  useEffect(() => {
    lucide.createIcons();
  }, [open]);

  const reading = COVERS.filter((b) => b.status === 'reading');

  return (
    <div className="reader-switcher" ref={ref}>
      <button
        className={'reader-switcher-trigger ' + (open ? 'is-open' : '')}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="reader-switcher-cover" style={{ background: book.bg }} />
        <div className="reader-switcher-id">
          <div className="t">{book.t}</div>
          <div className="m">
            {book.a} · 12 세션 · 한 줄 {book.quotes || 14}개 담음
          </div>
        </div>
        <Icon name="chevron-down" className="icon reader-switcher-chev" />
      </button>
      {open && (
        <div className="reader-switcher-pop" role="menu">
          <div className="reader-switcher-eyebrow">읽는 중 · {reading.length}권</div>
          {reading.map((b, i) => {
            const isActive = b.t === book.t;
            return (
              <button
                key={i}
                className={'reader-switcher-item ' + (isActive ? 'is-active' : '')}
                onClick={() => {
                  onPick && onPick(b);
                  setOpen(false);
                }}
                role="menuitem"
              >
                <div className="reader-switcher-cover sm" style={{ background: b.bg }} />
                <div className="reader-switcher-id">
                  <div className="t">{b.t}</div>
                  <div className="m">
                    {b.a}
                    {b.bookmark ? ` · 마지막 북마크 p.${b.bookmark}` : ''}
                    {b.lastActive ? ` · ${b.lastActive}` : ''}
                  </div>
                </div>
                {isActive && <span className="reader-switcher-now">지금 읽는 중</span>}
              </button>
            );
          })}
          <div className="reader-switcher-foot">
            <Icon name="library" className="icon icon-sm" />
            <span>
              다른 책은 <b>내 서재</b>에서 열어보세요
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PageReader({ empty }) {
  // Default to the first 읽는 중 book; let the switcher swap it.
  const reading = COVERS.filter((b) => b.status === 'reading');
  const [book, setBook] = useState(reading[0]);
  return (
    <>
      <div className="top reader-top">
        <ReaderBookSwitcher book={book} onPick={setBook} />
        <div className="top-actions">
          <SessionTimer />
          <div className="search search-pill" style={{ width: 280 }}>
            <input placeholder="책, 작가, 밑줄 검색" />
          </div>
        </div>
      </div>
      <div className="reader-grid">
        <ReaderPane book={book} empty={empty} />
        <ChatPanel book={{ t: book.t }} empty={empty} />
      </div>
    </>
  );
}

function PageQuotes({ openCapture, openShareQuote, openQmenu }) {
  return (
    <>
      <TopBar
        title="밑줄 모음"
        subtitle="123개의 문장 · 이번 달 18개 추가"
        primary="한 줄 담기"
        primaryIcon="camera"
        onPrimary={openCapture}
      />
      <div className="quote-feed">
        {QUOTES.map((q, i) => (
          <QuoteCard key={i} q={q} onMenu={(anchor, qq) => openQmenu(anchor, qq)} />
        ))}
        {QUOTES.map((q, i) => (
          <QuoteCard key={'b' + i} q={q} onMenu={(anchor, qq) => openQmenu(anchor, qq)} />
        ))}
        {QUOTES.map((q, i) => (
          <QuoteCard key={'c' + i} q={q} onMenu={(anchor, qq) => openQmenu(anchor, qq)} />
        ))}
      </div>
    </>
  );
}

function Footer() {
  const cols = [
    {
      h: '책담',
      links: [
        { t: '서비스 소개', href: '#' },
        { t: '브랜드 이야기', href: '#' },
        { t: '공지사항', href: '#' },
        { t: '업데이트 로그', href: '#' },
      ],
    },
    {
      h: '도움말',
      links: [
        { t: '자주 묻는 질문', href: '#' },
        { t: '문의하기', href: '#' },
        { t: '독서 가이드', href: '#' },
      ],
    },
    {
      h: '약관',
      links: [
        { t: '이용약관', href: '#' },
        { t: '개인정보 처리방침', href: '#' },
        { t: '운영정책', href: '#' },
      ],
    },
  ];
  const social = [
    { name: 'instagram', label: 'Instagram' },
    { name: 'youtube', label: 'YouTube' },
    { name: 'twitter', label: 'X' },
    { name: 'mail', label: '뉴스레터' },
  ];
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-mark">
            <span className="wm">책담</span>
            <span className="tag">Chaekdam</span>
          </div>
          <p className="brand-line">
            한 줄을 담아두는 곳.
            <br />
            오늘 그은 문장이 내일의 나에게 가닿도록.
          </p>
          <div className="social">
            {social.map((s) => (
              <a key={s.name} href="#" aria-label={s.label}>
                <Icon name={s.name} className="icon icon-sm" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-cols">
          {cols.map((col) => (
            <div className="footer-col" key={col.h}>
              <h4>{col.h}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.t}>
                    <a href={l.href}>{l.t}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">
          <div>책담 주식회사 · 대표 홍길동 · 사업자등록번호 123-45-67890</div>
          <div>서울특별시 마포구 양화로 45, 8층 · reader@chaekdam.kr · 02-1234-5678</div>
        </div>
        <div className="footer-meta">
          <span>© 2026 Chaekdam Inc.</span>
          <span className="dot">·</span>
          <a href="#">한국어</a>
        </div>
      </div>
    </footer>
  );
}

// ───── Wishlist page ─────
function PageWishlist({ openAddBook, openBook, notify, empty: forceEmpty }) {
  const [sort, setSort] = useState('recent'); // recent · title · author
  const items = React.useMemo(() => {
    if (forceEmpty) return [];
    const arr = WISHLIST.slice();
    if (sort === 'title') arr.sort((a, b) => a.t.localeCompare(b.t, 'ko'));
    if (sort === 'author') arr.sort((a, b) => a.a.localeCompare(b.a, 'ko'));
    // recent is the source order (already by addedAt desc).
    return arr;
  }, [sort, forceEmpty]);
  const empty = items.length === 0;

  return (
    <>
      <TopBar
        title="읽고 싶은 책"
        subtitle={
          empty
            ? '관심 가는 책을 모아두는 책장이에요.'
            : `${items.length}권 · 가장 오래 담아둔 책 ${WISHLIST[WISHLIST.length - 1].t}`
        }
        primary="책 추가"
        primaryIcon="plus"
        onPrimary={openAddBook}
      />

      {empty ? (
        <div className="wish-empty wish-empty-full">
          <div className="wish-empty-ico lg">
            <Icon name="bookmark-plus" className="icon" />
          </div>
          <div className="wish-empty-t">아직 담아둔 책이 없어요</div>
          <div className="wish-empty-s">
            서점에서 마주친 책, 추천 받은 책, 다음에 꼭 읽고 싶은 책을
            <br />
            여기에 담아두면 다음 읽을 책이 비어 보이지 않아요.
          </div>
          <button
            className="btn btn-primary wish-empty-cta"
            onClick={() => openAddBook && openAddBook()}
          >
            <Icon name="plus" className="icon icon-sm" />책 담으러 가기
          </button>
        </div>
      ) : (
        <>
          <div className="lib-filters wish-filters">
            {[
              ['recent', '최근 담은 순'],
              ['title', '제목 가나다'],
              ['author', '작가 가나다'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={'chip ' + (sort === k ? 'is-active' : '')}
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="wish-grid">
            {items.map((b, i) => (
              <article
                className="wish-tile"
                key={i}
                onClick={() =>
                  openBook &&
                  openBook({
                    t: b.t,
                    a: b.a,
                    bg: b.bg,
                    status: 'wish',
                    startedAt: b.addedAt,
                    format: '전자책',
                    tags: [],
                  })
                }
              >
                <div className="wish-cover" style={{ background: b.bg }}>
                  <span className="status-badge is-wish sm wish-cover-pill">담아둠</span>
                </div>
                <div className="wish-body">
                  <div className="wish-title">{b.t}</div>
                  <div className="wish-author">{b.a}</div>
                  {b.note && <p className="wish-note">“{b.note}”</p>}
                  <div className="wish-meta">
                    <span className="wish-added">{b.addedAt} 담음</span>
                  </div>
                  <div className="wish-actions">
                    <button
                      className="btn btn-primary btn-sm wish-action-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        notify && notify(`${b.t} · 읽기 시작했어요`);
                      }}
                    >
                      <Icon name="book-open" className="icon icon-sm" />
                      지금부터 읽기
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      title="위시리스트에서 빼기"
                      onClick={(e) => {
                        e.stopPropagation();
                        notify && notify('위시리스트에서 뺐어요');
                      }}
                    >
                      <Icon name="bookmark-x" className="icon icon-sm" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}

Object.assign(window, {
  Sidebar,
  TopBar,
  Hero,
  BookCard,
  QuoteCard,
  StreakCard,
  RecCard,
  WishlistCard,
  WISHLIST,
  PERSONAS,
  ReaderPane,
  ChatPanel,
  CaptureDialog,
  Footer,
  PageHome,
  PageLibrary,
  PageReader,
  PageQuotes,
  PageWishlist,
});
