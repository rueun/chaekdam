// Chaekdam web UI kit — additional pages
// Covers screens for every clickable surface in the kit:
//   PageStats        ← sidebar "독서 기록"
//   PageSettings     ← sidebar "설정"
//   PageTalk         ← sidebar "AI 독서토론" (full-screen chat, not the side panel)
//   PageBook         ← BookCard click (book detail, distinct from Reader)
//   NotificationPanel← TopBar bell click

const { useState: _useStateX, useEffect: _useEffectX } = React;

// ─────────────────────────────────────────────
//  Notifications panel (dropdown from top-right)
// ─────────────────────────────────────────────
function NotificationPanel({ open, onClose }) {
  if (!open) return null;
  const items = [
    {
      ico: 'sparkles',
      tt: 'AI 토론자가 새 질문을 보냈어요',
      sub: '『일곱 해의 마지막』 4장에 대해',
      t: '방금',
      accent: true,
    },
    { ico: 'flame', tt: '오늘 읽기 알림', sub: '저녁 9시, 한 줄을 권해드릴게요', t: '1시간 전' },
    { ico: 'book-marked', tt: '완독을 축하해요', sub: '『바깥은 여름』· 4월 22일', t: '어제' },
    { ico: 'pen-line', tt: '한 줄이 새로 저장됐어요', sub: '『작별인사』 p.112', t: '2일 전' },
  ];
  return (
    <>
      <div className="notif-scrim" onClick={onClose} />
      <div className="notif-panel" role="dialog">
        <header>
          <div className="ttl">알림</div>
          <button className="lnk">모두 읽음</button>
        </header>
        <div className="notif-list">
          {items.map((n, i) => (
            <div className={'notif ' + (n.accent ? 'is-new' : '')} key={i}>
              <div className="ico">
                <Icon name={n.ico} className="icon icon-sm" />
              </div>
              <div className="body">
                <div className="tt">{n.tt}</div>
                <div className="sub">{n.sub}</div>
              </div>
              <div className="t">{n.t}</div>
            </div>
          ))}
        </div>
        <footer>
          <button className="btn btn-ghost" style={{ width: '100%' }}>
            모든 알림 보기 →
          </button>
        </footer>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  독서 기록 (Stats) page
// ─────────────────────────────────────────────
function PageStats(_props) {
  // Yearly contribution-style grid (52 weeks × 7 days)
  const today = new Date(2025, 10, 18);
  const yearStart = new Date(2025, 0, 1);
  const dayOfYear = Math.floor((today - yearStart) / (24 * 60 * 60 * 1000));
  // simulate dense read days
  const reads = new Set();
  for (let i = 0; i < dayOfYear; i++) {
    const intensity = Math.sin(i / 9) * 0.5 + Math.cos(i / 4) * 0.3 + 0.5;
    if (intensity > 0.35) reads.add(i);
  }
  const weeks = 52;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const isFuture = idx > dayOfYear;
      const isRead = reads.has(idx);
      cells.push({ w, d, idx, isFuture, isRead });
    }
  }

  return (
    <>
      <TopBar title="독서 기록" subtitle="2025년 · 47권 · 312개의 한 줄 · 14일 연속" />

      <div className="stats-hero">
        <div className="sh-num">
          <b>47</b>
          <small>권 완독</small>
        </div>
        <div className="sh-num">
          <b>14</b>
          <small>일 연속</small>
        </div>
        <div className="sh-num">
          <b>312</b>
          <small>한 줄</small>
        </div>
        <div className="sh-num">
          <b>68</b>
          <small>시간 12분</small>
        </div>
      </div>

      <div className="h-section">
        <h2>2025년 독서 캘린더</h2>
        <a>다른 해 보기 →</a>
      </div>
      <div className="stats-cal">
        <div className="sc-dow">
          <span></span>
          <span>월</span>
          <span></span>
          <span>수</span>
          <span></span>
          <span>금</span>
          <span></span>
        </div>
        <div className="sc-grid">
          {cells.map((c) => (
            <div
              key={c.idx}
              className={
                'sc-cell ' + (c.isRead ? 'is-read' : '') + (c.isFuture ? ' is-future' : '')
              }
              style={{ gridColumn: c.w + 1, gridRow: c.d + 1 }}
            />
          ))}
        </div>
        <div className="sc-legend">
          <span>적게</span>
          <span className="sw l0"></span>
          <span className="sw l1"></span>
          <span className="sw l2"></span>
          <span className="sw l3"></span>
          <span>많이</span>
        </div>
      </div>

      <div className="stats-2col">
        <div className="rail-card stats-card">
          <h3>가장 많이 읽은 장르</h3>
          {[
            { l: '한국 소설', n: 18, p: 38 },
            { l: '에세이', n: 12, p: 26 },
            { l: '시', n: 7, p: 15 },
            { l: '인문', n: 6, p: 13 },
            { l: '비소설', n: 4, p: 8 },
          ].map((g, i) => (
            <div className="bar-row" key={i}>
              <div className="bar-l">{g.l}</div>
              <div className="bar-bar">
                <div className="bar-fill" style={{ width: g.p + '%' }} />
              </div>
              <div className="bar-n">{g.n}권</div>
            </div>
          ))}
        </div>
        <div className="rail-card stats-card">
          <h3>이번 해 가장 사랑한 작가</h3>
          {[
            { n: '김연수', q: 28, b: 4 },
            { n: '김애란', q: 22, b: 3 },
            { n: '이현우', q: 18, b: 2 },
            { n: '이도우', q: 11, b: 2 },
          ].map((a, i) => (
            <div className="auth-row" key={i}>
              <div className="auth-av">{a.n[0]}</div>
              <div className="auth-info">
                <div className="n">{a.n}</div>
                <div className="m">
                  {a.b}권 · 한 줄 {a.q}개
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  설정 (Settings) page
// ─────────────────────────────────────────────
function PageSettings({ openProfile, openConfirm, notify }) {
  const profileClick = () => openProfile && openProfile();
  const exportData = () => notify && notify('내보내기 파일을 준비하고 있어요');
  const deleteData = () =>
    openConfirm &&
    openConfirm({
      title: '모든 독서 기록을 삭제할까요?',
      body: (
        <>
          이번 해 독서 기록, 한 줄 312개, AI 토론 기록을 포함한 모든 데이터가 영구히 삭제돼요.{' '}
          <b>되돌릴 수 없어요.</b>
        </>
      ),
      confirmText: '데이터 삭제',
      requireType: '책담 삭제',
    });
  return (
    <>
      <TopBar title="설정" subtitle="계정과 환경" />
      <div className="settings-wrap">
        <section className="s-card">
          <div className="s-card-head">
            <h3>계정</h3>
          </div>
          <div className="s-row">
            <div className="s-avatar">홍</div>
            <div className="s-info">
              <div className="n">홍길동</div>
              <div className="m">reader@chaekdam.kr</div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: 'auto' }}
              onClick={profileClick}
            >
              프로필 수정
            </button>
          </div>
        </section>

        <section className="s-card">
          <h3>AI 독서토론</h3>
          <p className="s-card-intro">
            새 대화를 시작할 때 기본으로 부를 토론자예요. 한 책에 여러 대화방을 둘 수 있고, 대화방을
            시작한 뒤엔 토론자를 바꿀 수 없어요.
          </p>
          <div className="persona-grid">
            {[
              {
                id: 'socrates',
                name: '소크라테스',
                role: '질문하는 사람',
                blurb: '답을 주지 않고 묻기만 해요. 본인 생각을 끌어내고 싶을 때.',
                preview: '이 문장을 따라 적은 이유는 무엇이었을까요?',
                ico: 'help-circle',
                default: true,
              },
              {
                id: 'critic',
                name: '비평가',
                role: '분석하는 사람',
                blurb: '작품의 구조·문체·당대 맥락을 짚어줘요.',
                preview: '백석의 시 운율이 이 장면의 호흡과 닮아 있죠.',
                ico: 'scan-text',
              },
              {
                id: 'author',
                name: '작가 본인',
                role: '쓴 사람의 목소리',
                blurb: '인터뷰·서신·산문에서 학습한 톤. 사망 작가에 한해 활성화돼요.',
                preview: '그때 저는 이 장면을 며칠을 두고 다듬었습니다.',
                ico: 'feather',
                badge: '책마다 다름',
              },
              {
                id: 'friend',
                name: '책 동무',
                role: '같이 읽는 친구',
                blurb: '한국 문학 좋아하는 가상의 독자. 분석하지 않고 같이 반응해줘요.',
                preview: '어, 나도 이 부분에서 한참 멈췄어요. 그 다음 장면도 좋지 않았어요?',
                ico: 'coffee',
              },
            ].map((p) => (
              <label key={p.id} className="persona-card">
                <input
                  type="radio"
                  name="persona"
                  className="persona-radio"
                  defaultChecked={!!p.default}
                />
                <div className="persona-head">
                  <div className="persona-ico">
                    <Icon name={p.ico} className="icon" />
                  </div>
                  <div className="persona-id">
                    <div className="persona-name">{p.name}</div>
                    <div className="persona-role">{p.role}</div>
                  </div>
                  {p.badge && <span className="persona-badge">{p.badge}</span>}
                </div>
                <p className="persona-blurb">{p.blurb}</p>
                <div className="persona-preview">
                  <span className="persona-preview-q">“</span>
                  {p.preview}
                </div>
              </label>
            ))}
          </div>
          <SetRow tt="자동 토론 시작" sub="완독 후 토론자가 먼저 질문">
            <input type="checkbox" className="toggle" />
          </SetRow>
        </section>

        <section className="s-card s-card-danger">
          <h3>데이터</h3>
          <SetRow tt="기록 내보내기" sub="JSON · CSV로 저장">
            <button className="btn btn-secondary" onClick={exportData}>
              내보내기
            </button>
          </SetRow>
          <SetRow tt="모든 데이터 삭제" sub="복구할 수 없습니다">
            <button className="btn btn-danger" onClick={deleteData}>
              데이터 삭제
            </button>
          </SetRow>
        </section>
      </div>
    </>
  );
}

function SetRow({ tt, sub, children }) {
  return (
    <div className="s-row">
      <div className="s-info">
        <div className="n">{tt}</div>
        {sub && <div className="m">{sub}</div>}
      </div>
      <div className="s-ctrl">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  AI 독서토론 — full-screen standalone
// ─────────────────────────────────────────────
function PageTalk({ openNewChat }) {
  // One book can host multiple discussion rooms — each room has a
  // single, fixed 토론자 (persona). The id encodes book+room so the
  // user can tell rooms apart in the rail.
  // Each session points back to a book via `coverBg` so the by-book
  // view can render a proper cover thumbnail in each group header.
  const sessions = [
    {
      id: 1,
      t: '일곱 해의 마지막',
      persona: 'socrates',
      sub: '4장 · 빛나는 것들에 대하여',
      when: '방금',
      turns: 14,
      active: true,
      coverBg: 'linear-gradient(155deg,#3F6750,#1F4030)',
    },
    {
      id: 2,
      t: '일곱 해의 마지막',
      persona: 'friend',
      sub: '백석에 대한 잡담',
      when: '어제',
      turns: 8,
      coverBg: 'linear-gradient(155deg,#3F6750,#1F4030)',
    },
    {
      id: 3,
      t: '바깥은 여름',
      persona: 'critic',
      sub: '완독 후 회고',
      when: '4월 22일',
      turns: 22,
      coverBg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
    },
    {
      id: 4,
      t: '문구의 모험',
      persona: 'socrates',
      sub: '1장 · 작은 도구들',
      when: '5월 14일',
      turns: 11,
      coverBg: 'linear-gradient(155deg,#D9963D,#86571B)',
    },
    {
      id: 5,
      t: '아주 사적인 독서',
      persona: 'author',
      sub: '에필로그',
      when: '3월 8일',
      turns: 9,
      coverBg: 'linear-gradient(155deg,#6B8C5F,#4A6741)',
    },
  ];
  const active = sessions.find((s) => s.active) || sessions[0];

  // 'recent' = flat time-sorted feed. 'book' = grouped by book title,
  // with the most-recent room of each book floated to the top of its
  // group. Same data, two reading lenses — power users want to browse
  // 'all my conversations about 일곱 해의 마지막', light users just
  // want 'what did I talk about most recently'.
  const [view, setView] = _useStateX('recent');
  // For 도서별 보기 only — 'all' shows every book group; otherwise a
  // single book title is selected and only that book's rooms render.
  const [bookFilter, setBookFilter] = _useStateX('all');

  // View toggles + dropdown changes re-render the rail with fresh
  // lucide <i data-lucide> placeholders that the app-level mount
  // effect never re-processes. Without this, persona-chip icons
  // appear as empty slots and the text drifts off-centre.
  _useEffectX(() => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, [view, bookFilter]);

  // Group by book title, preserving session order so the newest room
  // within each book stays first. Book groups themselves are sorted by
  // their most-recent member's position in the original feed.
  const grouped = React.useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      if (!map.has(s.t)) map.set(s.t, { t: s.t, coverBg: s.coverBg, rooms: [] });
      map.get(s.t).rooms.push(s);
    });
    return Array.from(map.values());
  }, [sessions]);

  const renderRoom = (s, opts = {}) => {
    const p = PERSONAS[s.persona] || PERSONAS.socrates;
    return (
      <button
        key={s.id}
        className={
          'talk-item ' + (s.active ? 'is-active' : '') + (opts.compact ? ' is-compact' : '')
        }
      >
        {!opts.compact && <div className="t">{s.t}</div>}
        <div className="talk-item-persona">
          <Icon name={p.ico} className="icon icon-sm" />
          <span>{p.name}</span>
        </div>
        <div className="m">{s.sub}</div>
        <div className="w">
          {s.when} · {s.turns}번
        </div>
      </button>
    );
  };

  return (
    <>
      <TopBar title="AI 독서토론" subtitle="책에 대해 천천히 묻고 답해보세요" />
      <div className="talk-page">
        <aside className="talk-side">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={openNewChat}
          >
            <Icon name="plus" className="icon icon-sm" />새 대화 시작
          </button>

          <div className="talk-tabs seg" role="tablist">
            <button
              className={'s ' + (view === 'recent' ? 'is-on' : '')}
              role="tab"
              aria-selected={view === 'recent'}
              onClick={() => setView('recent')}
            >
              최근 대화
            </button>
            <button
              className={'s ' + (view === 'book' ? 'is-on' : '')}
              role="tab"
              aria-selected={view === 'book'}
              onClick={() => setView('book')}
            >
              도서별 보기
            </button>
          </div>

          {view === 'book' && (
            <select
              className="sel talk-book-sel"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              aria-label="도서 선택"
            >
              <option value="all">전체 도서</option>
              {grouped.map((g) => (
                <option key={g.t} value={g.t}>
                  {g.t}
                </option>
              ))}
            </select>
          )}

          {view === 'recent' && (
            <div className="talk-list">{sessions.map((s) => renderRoom(s))}</div>
          )}

          {view === 'book' && (
            <div className="talk-groups">
              {grouped
                .filter((g) => bookFilter === 'all' || g.t === bookFilter)
                .map((g) => (
                  <section key={g.t} className="talk-group">
                    <header className="talk-group-head">
                      <div className="talk-group-cover" style={{ background: g.coverBg }} />
                      <div className="talk-group-id">
                        <div className="talk-group-title">{g.t}</div>
                        <div className="talk-group-count">대화방 {g.rooms.length}개</div>
                      </div>
                    </header>
                    <div className="talk-group-rooms">
                      {g.rooms.map((s) => renderRoom(s, { compact: true }))}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </aside>
        <div className="talk-main">
          <ChatPanel persona={active.persona} book={{ t: active.t }} />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  책 상세 — clicked from BookCard
// ─────────────────────────────────────────────
function PageBook({ b, setTab, openAddBook, notify }) {
  const onRead = () => setTab && setTab('reader');
  const book = b || COVERS[0];
  const isDone = book.status === 'done';
  const lines = QUOTES.slice(0, 3);
  // Star rendering — filled, half, empty
  const renderStars = (r) => {
    if (!r) return null;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="bookd-stars" aria-label={r + ' / 5'}>
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
        <small>{r.toFixed(1)}</small>
      </span>
    );
  };
  return (
    <>
      <TopBar title=" " subtitle=" " />
      <div className="bookd">
        <div className="bookd-left">
          <div className="bookd-cover" style={{ background: book.bg }}>
            {book.t}
          </div>
          <div className="bookd-cover-meta">
            <span>{book.format || '종이책'}</span>
            <span>·</span>
            <span>{book.startedAt || '—'} 시작</span>
          </div>
        </div>
        <div className="bookd-body">
          <div className="bookd-eyebrow">한국 소설 · 장편</div>
          <h1 className="bookd-title">{book.t}</h1>
          <div className="bookd-author">{book.a} · 문학과지성사 · 2020</div>

          <div className="bookd-chips">
            <span className={'status-badge is-' + (book.status || 'reading')}>
              {STATUS_LABEL[book.status] || '읽는 중'}
            </span>
            {book.format && <span className="chip chip-soft chip-sm">{book.format}</span>}
            {(book.tags || []).map((t) => (
              <span key={t} className="chip chip-sm">
                {t}
              </span>
            ))}
            <button
              className="chip chip-sm chip-add"
              onClick={() => notify && notify('태그 입력 모드')}
            >
              + 태그
            </button>
          </div>

          {isDone && book.rating && (
            <div className="bookd-rating">
              {renderStars(book.rating)}
              {book.review && <div className="review">"{book.review}"</div>}
              <button className="lnk" onClick={() => notify && notify('별점 수정 모드')}>
                별점 수정
              </button>
            </div>
          )}

          <div className="bookd-stats">
            <div className="st">
              <b>{isDone ? '완독' : '읽는 중'}</b>
              <span>{isDone ? (book.finishedAt || '') + ' 마침' : '12일째 읽는 중'}</span>
            </div>
            {!isDone && book.bookmark && (
              <div className="st">
                <b>p.{book.bookmark}</b>
                <span>내가 적은 북마크</span>
              </div>
            )}
            {isDone && (
              <div className="st">
                <b>
                  {book.sessions || 0}
                  <small> 세션</small>
                </b>
                <span>읽기 횟수</span>
              </div>
            )}
            <div className="st">
              <b>
                {book.quotes || 0}
                <small> 개</small>
              </b>
              <span>한 줄 담음</span>
            </div>
            <div className="st">
              <b>{book.startedAt || '—'}</b>
              <span>읽기 시작</span>
            </div>
          </div>

          <h3 className="bookd-h">책 소개</h3>
          <p className="bookd-p">
            시인 백석을 모티프로 한 김연수의 장편소설. 한 시인의 침묵과 한 사람의 기다림, 그리고 그
            사이에 흐르는 시대의 폭력. 마음에 닻을 내리는 문장들이 천천히 쌓여가는 이야기.
          </p>

          <h3 className="bookd-h">이 책에서 담은 한 줄</h3>
          <div className="bookd-quotes">
            {lines.map((q, i) => (
              <QuoteCard key={i} q={q} />
            ))}
          </div>

          <h3 className="bookd-h">이 책의 AI 독서토론</h3>
          <p className="bookd-h-sub">
            대화방마다 한 명의 토론자와 깊이 이야기해요. 같은 책에 여러 방을 둘 수 있어요.
          </p>
          <ul className="bookd-talks">
            {[
              {
                persona: 'socrates',
                sub: '4장 · 빛나는 것들에 대하여',
                when: '방금',
                turns: 14,
                active: true,
              },
              { persona: 'friend', sub: '백석에 대한 잡담', when: '어제', turns: 8 },
            ].map((s, i) => {
              const p = PERSONAS[s.persona] || PERSONAS.socrates;
              return (
                <li
                  key={i}
                  className={'bookd-talk ' + (s.active ? 'is-active' : '')}
                  onClick={() => setTab && setTab('talk')}
                >
                  <div className="bookd-talk-ico">
                    <Icon name={p.ico} className="icon" />
                  </div>
                  <div className="bookd-talk-main">
                    <div className="bookd-talk-head">
                      <span className="bookd-talk-persona">{p.name}</span>
                      <span className="bookd-talk-dot">·</span>
                      <span className="bookd-talk-sub">{s.sub}</span>
                    </div>
                    <div className="bookd-talk-meta">
                      <span>{s.when}</span>
                      <span>·</span>
                      <span>{s.turns}번 주고받음</span>
                    </div>
                  </div>
                  <Icon name="chevron-right" className="icon icon-sm bookd-talk-chev" />
                </li>
              );
            })}
            <li className="bookd-talk bookd-talk-new" onClick={() => setTab && setTab('talk')}>
              <div className="bookd-talk-ico bookd-talk-ico-add">
                <Icon name="plus" className="icon" />
              </div>
              <div className="bookd-talk-main">
                <div className="bookd-talk-persona">새 대화 시작</div>
                <div className="bookd-talk-meta">다른 토론자와 이야기해 보세요</div>
              </div>
            </li>
          </ul>

          <h3 className="bookd-h">최근 세션</h3>
          <ol className="bookd-sessions">
            <li>
              <span className="date">11월 18일 · 화</span>
              <span className="dur">한 줄 1개 담김</span>
              <span className="note">p.220 → p.234</span>
            </li>
            <li>
              <span className="date">11월 17일 · 월</span>
              <span className="dur">AI 토론 1회</span>
              <span className="note">—</span>
            </li>
            <li>
              <span className="date">11월 15일 · 토</span>
              <span className="dur">한 줄 3개 담김</span>
              <span className="note">p.198 → p.220</span>
            </li>
            <li>
              <span className="date">11월 12일 · 수</span>
              <span className="dur">한 줄 2개 담김</span>
              <span className="note">p.184 → p.198</span>
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  NotificationPanel,
  PageStats,
  PageSettings,
  PageTalk,
  PageBook,
});
