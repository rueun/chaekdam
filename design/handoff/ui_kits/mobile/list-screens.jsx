// Chaekdam mobile UI kit — list screens that mirror the web kit
//   QuotesListScreen  ← 밑줄 모음 (web: PageQuotes)  — home "최근 밑줄 · 전체"
//   WishlistScreen    ← 읽고 싶은 (web: PageWishlist) — library "읽고 싶은" shelf
//
// Both reuse the existing mobile vocabulary (m-top, m-quote, m-chips,
// status-badge, chip). Screen-specific layout lives in missing.css.

const LsIc = {
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
  open: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5z" />
      <path d="M12 6.5V19" />
    </svg>
  ),
  bmx: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4h10v17l-5-3-5 3z" />
      <path d="M9.5 9.5l5 4M14.5 9.5l-5 4" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
//  밑줄 모음 — every captured line, newest first
// ─────────────────────────────────────────────
const ML_QUOTES = [
  {
    t: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
    a: '김연수',
    b: '일곱 해의 마지막',
    p: 'p.42',
    when: '3일 전',
  },
  {
    t: '사람은 자기가 좋아하는 것에 대해서만 깊이 생각할 수 있다.',
    a: '김영하',
    b: '작별인사',
    p: 'p.42',
    when: '어제',
  },
  {
    t: '좋은 책을 읽는다는 것은 과거 몇 세기의 가장 훌륭한 사람들과 대화하는 것과 같다.',
    a: '데카르트',
    b: '방법서설',
    p: 'p.18',
    when: '3일 전',
  },
  {
    t: '독서는 결국 자기 자신과의 가장 오래된 대화이고, 가장 천천히 답이 도착하는 편지이다.',
    a: '이현우',
    b: '아주 사적인 독서',
    p: 'p.118',
    when: '5일 전',
  },
  {
    t: '기억은 우리가 살아간 시간의 증거이지만, 동시에 우리가 살아가야 할 시간에 대한 약속이기도 했다.',
    a: '김영하',
    b: '작별인사',
    p: 'p.88',
    when: '6일 전',
  },
  {
    t: '슬픔은 공부하는 것이다. 충분히 슬퍼한 사람만이 다른 사람의 슬픔 곁에 앉을 수 있다.',
    a: '신형철',
    b: '슬픔을 공부하는 슬픔',
    p: 'p.7',
    when: '1주 전',
  },
  {
    t: '어떤 문장은 마음에 닻을 내린다. 우리는 자주, 우리도 모르게, 누군가의 문장 위에 정박해 살아간다.',
    a: '김연수',
    b: '일곱 해의 마지막',
    p: 'p.203',
    when: '2주 전',
  },
];

function QuotesListScreen({ onBack, onOpenQuote }) {
  const [sort, setSort] = React.useState('recent');
  return (
    <div className="m-quotelist" data-screen-label="15 Quotes">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {LsIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>밑줄 모음</div>
        <div style={{ width: 30 }} />
      </div>

      <div className="m-quotelist-head">
        <div className="big">
          {ML_QUOTES.length}
          <small>개의 한 줄</small>
        </div>
        <div className="sub">이번 달 18개 추가 · 47권에서</div>
      </div>

      <div className="m-chips">
        {[
          ['recent', '최근 담은 순'],
          ['book', '책별'],
          ['author', '작가별'],
        ].map(([k, l]) => (
          <button key={k} className={`chip ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>
            {l}
          </button>
        ))}
      </div>

      <div className="m-quotelist-feed">
        {ML_QUOTES.map((q, i) => (
          <div key={i} className="m-quote" onClick={onOpenQuote} style={{ cursor: 'pointer' }}>
            <div className="qt">{q.t}</div>
            <div className="qm">
              <b>{q.a}</b> · {q.b} · {q.p} · {q.when}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  읽고 싶은 — saved books, most-recently-added first
// ─────────────────────────────────────────────
const ML_WISH = [
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

function WishlistScreen({ onBack, onOpenBook, onAddBook, onNotify }) {
  const [sort, setSort] = React.useState('recent');
  const items = React.useMemo(() => {
    const arr = ML_WISH.slice();
    if (sort === 'title') arr.sort((a, b) => a.t.localeCompare(b.t, 'ko'));
    if (sort === 'author') arr.sort((a, b) => a.a.localeCompare(b.a, 'ko'));
    return arr;
  }, [sort]);

  return (
    <div className="m-wishlist" data-screen-label="16 Wishlist">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {LsIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>읽고 싶은</div>
        <button
          className="avatar"
          style={{ background: 'transparent', color: 'var(--ink-700)' }}
          onClick={onAddBook}
          aria-label="책 추가"
        >
          {LsIc.plus}
        </button>
      </div>

      <div className="m-quotelist-head">
        <div className="big">
          {ML_WISH.length}
          <small>권 담아둠</small>
        </div>
        <div className="sub">가장 오래 담아둔 책 · {ML_WISH[ML_WISH.length - 1].t}</div>
      </div>

      <div className="m-chips">
        {[
          ['recent', '최근 담은 순'],
          ['title', '제목 가나다'],
          ['author', '작가 가나다'],
        ].map(([k, l]) => (
          <button key={k} className={`chip ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>
            {l}
          </button>
        ))}
      </div>

      <div className="m-wish-list">
        {items.map((b, i) => (
          <div key={i} className="m-wish-row" onClick={onOpenBook} style={{ cursor: 'pointer' }}>
            <div className="m-wish-cover" style={{ background: b.bg }}>
              <span className="status-badge is-wish sm">담아둠</span>
            </div>
            <div className="m-wish-body">
              <div className="m-wish-title">{b.t}</div>
              <div className="m-wish-author">
                {b.a} · {b.addedAt} 담음
              </div>
              {b.note && <p className="m-wish-note">“{b.note}”</p>}
              <div className="m-wish-actions">
                <button
                  className="m-wish-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotify && onNotify(`${b.t} · 읽기 시작했어요`);
                  }}
                >
                  {LsIc.open}지금부터 읽기
                </button>
                <button
                  className="m-wish-remove"
                  aria-label="위시리스트에서 빼기"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotify && onNotify('위시리스트에서 뺐어요');
                  }}
                >
                  {LsIc.bmx}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { QuotesListScreen, WishlistScreen });
