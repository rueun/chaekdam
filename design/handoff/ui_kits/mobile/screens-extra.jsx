// Chaekdam mobile UI kit — additional screens
//   BookDetailScreen     ← LibraryScreen book tap
//   SettingsScreen       ← ProfileScreen "설정" row
//   NotificationsScreen  ← bell tap (any)
//   SearchScreen         ← top-right search tap

const McIc = {
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
  bell: (
    <svg
      className="icon"
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
  heart: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
    </svg>
  ),
  x: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  flame: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5 1-3 1-3s2 1 2 3M5 14a7 7 0 1 0 14 0c0-4-3-7-3-7" />
    </svg>
  ),
};

// ---------------- Book detail ----------------
function BookDetailScreen({ onBack, onOpenChat, onOpenReader, onShare, onOpenQuote, onNotify }) {
  return (
    <div data-screen-label="07 Book Detail" className="m-bookd-screen">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {McIc.back}
        </button>
        <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>책 상세</div>
        <button
          style={{ background: 'transparent', padding: 6 }}
          onClick={onShare}
          aria-label="공유"
        >
          {McIc.share}
        </button>
      </div>

      <div className="m-bookd-hero">
        <div
          className="m-bookd-cover"
          style={{ background: 'linear-gradient(155deg,#1F2A1B,#4A6741)' }}
        >
          작별인사
        </div>
        <div className="m-bookd-meta">
          <div className="eb">한국 문학 · 장편</div>
          <div className="tt">작별인사</div>
          <div className="au">김영하 · 복복서가</div>
        </div>
      </div>

      <div className="m-bookd-chips">
        <span className="status-badge is-reading">읽는 중</span>
        <span className="chip chip-soft chip-sm">종이책</span>
        <span className="chip chip-sm">#한국문학</span>
        <span className="chip chip-sm">#장편</span>
        <button
          className="chip chip-sm chip-add"
          onClick={() => onNotify && onNotify('태그 입력 모드')}
        >
          + 태그
        </button>
      </div>

      <div className="m-bookd-stats">
        <div className="st">
          <b>p.112</b>
          <span>내 북마크</span>
        </div>
        <div className="st">
          <b>14</b>
          <span>한 줄 담음</span>
        </div>
        <div className="st">
          <b>5</b>
          <span>세션</span>
        </div>
      </div>

      <div className="m-bookd-sessions">
        <div className="sec-lbl">최근 세션</div>
        <div className="sess">
          <div className="row">
            <div className="d">11월 17일 · 월</div>
            <div className="dur">한 줄 1개 담김</div>
          </div>
          <div className="row">
            <div className="d">11월 15일 · 토</div>
            <div className="dur">AI 토론 1회</div>
          </div>
          <div className="row">
            <div className="d">11월 14일 · 금</div>
            <div className="dur">p.84 → p.112</div>
          </div>
        </div>
      </div>

      <div className="m-bookd-actions">
        <button className="m-action primary" onClick={onOpenReader}>
          이어 읽기
        </button>
        <button className="m-action ghost" onClick={onOpenChat}>
          AI와 토론
        </button>
      </div>

      <div className="m-section" style={{ marginTop: 24 }}>
        <div className="m-h2">책 소개</div>
      </div>
      <p className="m-bookd-desc">
        기계와 인간의 경계가 흐릿해진 가까운 미래. 한 소년의 마지막 인사를 통해, 우리가 누구이며
        무엇을 사랑했는지를 묻는 김영하의 장편소설.
      </p>

      <div className="m-section" style={{ marginTop: 18 }}>
        <div className="m-h2">이 책에서 담은 한 줄</div>
      </div>
      <div className="m-quote" onClick={onOpenQuote} style={{ cursor: 'pointer' }}>
        <div className="qt">사람은 자기가 좋아하는 것에 대해서만 깊이 생각할 수 있다.</div>
        <div className="qm">
          <b>p.42</b> · 어제
        </div>
      </div>
      <div className="m-quote" onClick={onOpenQuote} style={{ cursor: 'pointer' }}>
        <div className="qt">
          <mark>"좋은 문장은 마음에 닻을 내린다"</mark>고 그는 말했다.
        </div>
        <div className="qm">
          <b>p.88</b> · 3일 전
        </div>
      </div>
    </div>
  );
}

// ---------------- Settings ----------------
function SettingsScreen({ onBack, onEditProfile, onNotify }) {
  return (
    <div data-screen-label="08 Settings" className="m-settings">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {McIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>설정</div>
        <div style={{ width: 30 }} />
      </div>

      <SectionLabel>계정</SectionLabel>
      <div className="m-cells">
        <div className="m-cell" onClick={onEditProfile} style={{ cursor: 'pointer' }}>
          <div className="m-cell-l">
            <div className="m-cell-av">홍</div>
            <div>
              <div className="m-cell-t">홍길동</div>
              <div className="m-cell-s">reader@chaekdam.kr</div>
            </div>
          </div>
          {McIc.chev}
        </div>
      </div>

      <SectionLabel>AI 독서토론</SectionLabel>
      <div className="m-persona-list">
        {[
          { id: 'socrates', name: '소크라테스', role: '질문하는 사람', ico: '?', selected: true },
          { id: 'critic', name: '비평가', role: '분석하는 사람' },
          { id: 'author', name: '작가 본인', role: '쓴 사람의 목소리', hint: '사망 작가만' },
          { id: 'friend', name: '책 동무', role: '같이 읽는 친구' },
        ].map((p) => (
          <label key={p.id} className={'m-persona-row ' + (p.selected ? 'is-selected' : '')}>
            <input
              type="radio"
              name="m-persona"
              className="m-persona-radio"
              defaultChecked={!!p.selected}
            />
            <div className="m-persona-meta">
              <div className="m-persona-name">{p.name}</div>
              <div className="m-persona-role">
                {p.role}
                {p.hint ? ` · ${p.hint}` : ''}
              </div>
            </div>
            <span className="m-persona-check" />
          </label>
        ))}
      </div>
      <div className="m-cells">
        <SCell
          tt="자동 토론 시작"
          sub="완독하면 토론자가 먼저 질문"
          right={<input type="checkbox" className="toggle toggle-lg" />}
        />
      </div>

      <SectionLabel>데이터</SectionLabel>
      <div className="m-cells">
        <SCell
          tt="기록 내보내기"
          v="JSON · CSV"
          onClick={() => onNotify && onNotify('내보내기 파일을 준비하고 있어요')}
        />
        <SCell tt="캐시 비우기" v="42MB" onClick={() => onNotify && onNotify('캐시를 비웠어요')} />
        <SCell tt="로그아웃" danger onClick={() => onNotify && onNotify('로그아웃되었어요')} />
      </div>

      <div
        style={{ textAlign: 'center', padding: '20px 0 12px', fontSize: 11, color: 'var(--fg-3)' }}
      >
        책담 1.0.4 (build 142)
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="m-sec-lbl">{children}</div>;
}

function SCell({ tt, sub, v, right, danger, onClick }) {
  return (
    <div className="m-cell" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="m-cell-l">
        <div>
          <div className={'m-cell-t ' + (danger ? 'is-danger' : '')}>{tt}</div>
          {sub && <div className="m-cell-s">{sub}</div>}
        </div>
      </div>
      {right ? (
        right
      ) : v ? (
        <span className="m-cell-v">
          {v}
          {McIc.chev}
        </span>
      ) : (
        McIc.chev
      )}
    </div>
  );
}

// ---------------- Notifications ----------------
function NotificationsScreen({ onBack }) {
  const items = [
    {
      ico: McIc.flame,
      tt: 'AI 토론자가 새 질문을 보냈어요',
      sub: '『작별인사』 p.112에 대해',
      t: '방금',
      accent: true,
    },
    { ico: McIc.bell, tt: '오늘 읽기 알림', sub: '저녁 9시, 한 줄을 권해드릴게요', t: '1시간 전' },
    { ico: McIc.bookmark, tt: '완독을 축하해요', sub: '『바깥은 여름』· 4월 22일', t: '어제' },
    { ico: McIc.flame, tt: '14일 연속 읽기', sub: '책을 펴고 한 줄을 그어주세요', t: '어제' },
  ];
  return (
    <div data-screen-label="09 Notifications" className="m-notifs">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {McIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>알림</div>
        <button
          style={{ background: 'transparent', padding: 6, fontSize: 12, color: 'var(--accent)' }}
        >
          모두 읽음
        </button>
      </div>

      <div className="m-sec-lbl">새 알림</div>
      <div className="m-cells">
        {items.slice(0, 1).map((n, i) => (
          <NotifRow key={i} {...n} />
        ))}
      </div>

      <div className="m-sec-lbl">최근 7일</div>
      <div className="m-cells">
        {items.slice(1).map((n, i) => (
          <NotifRow key={i} {...n} />
        ))}
      </div>
    </div>
  );
}

function NotifRow({ ico, tt, sub, t, accent }) {
  return (
    <div className="m-cell m-cell-notif">
      <div className={'m-cell-l ' + (accent ? 'is-new' : '')}>
        <div className={'m-notif-ico ' + (accent ? 'is-new' : '')}>{ico}</div>
        <div style={{ minWidth: 0 }}>
          <div className="m-cell-t" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tt}
            {accent && <span className="m-dot" />}
          </div>
          <div className="m-cell-s">{sub}</div>
        </div>
      </div>
      <div className="m-cell-w">{t}</div>
    </div>
  );
}

// ---------------- Search ----------------
function SearchScreen({ onBack, onOpenBook, onOpenQuote }) {
  const recent = ['김영하', '작별인사', '에세이', '시', '한국 문학'];
  return (
    <div data-screen-label="10 Search" className="m-search-page">
      <div className="m-search-bar">
        <button onClick={onBack} style={{ background: 'transparent', padding: 6 }}>
          {McIc.back}
        </button>
        <div className="search">
          <input placeholder="책, 작가, 한 줄을 검색해 보세요" autoFocus defaultValue="김영하" />
        </div>
      </div>

      <div className="m-sec-lbl">결과</div>
      <div className="m-cells">
        <div className="m-cell" onClick={onOpenBook} style={{ cursor: 'pointer' }}>
          <div className="m-cell-l">
            <div
              className="m-cell-thumb"
              style={{ background: 'linear-gradient(155deg,#1F2A1B,#4A6741)' }}
            >
              작
            </div>
            <div>
              <div className="m-cell-t">작별인사</div>
              <div className="m-cell-s">김영하 · 장편소설</div>
            </div>
          </div>
          {McIc.chev}
        </div>
        <div className="m-cell" onClick={onOpenBook} style={{ cursor: 'pointer' }}>
          <div className="m-cell-l">
            <div
              className="m-cell-thumb"
              style={{ background: 'linear-gradient(155deg,#3F6750,#1F4030)' }}
            >
              여
            </div>
            <div>
              <div className="m-cell-t">여행의 이유</div>
              <div className="m-cell-s">김영하 · 에세이</div>
            </div>
          </div>
          {McIc.chev}
        </div>
      </div>

      <div className="m-sec-lbl">한 줄에서 발견</div>
      <div className="m-cells">
        <div
          className="m-cell"
          onClick={onOpenQuote}
          style={{ display: 'block', padding: '14px 16px', cursor: 'pointer' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--ink-800)',
            }}
          >
            "<b style={{ color: 'var(--ink-900)' }}>김영하</b>의 문장은 단단하다. 그 단단함이 끝내
            부드러워질 때까지 읽고 싶다."
          </div>
          <div className="m-cell-s" style={{ marginTop: 6 }}>
            독서 메모 · 어제
          </div>
        </div>
      </div>

      <div className="m-sec-lbl">최근 검색</div>
      <div className="m-recent-chips">
        {recent.map((r) => (
          <button key={r} className="m-recent">
            {r}
            <span className="x">×</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  BookDetailScreen,
  SettingsScreen,
  NotificationsScreen,
  SearchScreen,
});
