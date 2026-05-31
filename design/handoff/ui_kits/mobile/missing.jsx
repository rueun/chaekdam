// Chaekdam mobile UI kit — missing screens
//   StatsScreen           (독서 기록 — was missing entirely)
//   ShareSheet            (quote / book share bottom sheet)
//   QuoteDetailScreen     (한 줄 상세 — quote tap target)
//   ForgotPasswordScreen
//   ProfileEditScreen
//
// Plus tiny helpers (Toast).

const { useState: _msUseStateM, useEffect: _msUseEffectM } = React;

const MmIc = {
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
  copy: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  ),
  link: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
  image: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 16-5-5L5 21" />
    </svg>
  ),
  heart: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
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
  pin: (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76V3h6v7.76l3 3.24v3H6v-3z" />
    </svg>
  ),
  trash: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  ),
  edit: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4l4 4-11 11H5v-4z" />
    </svg>
  ),
  folder: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  mail: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  msg: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a8 8 0 0 1-11.4 7.2L4 21l1.8-5.6A8 8 0 1 1 21 12z" />
    </svg>
  ),
  more: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
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
  cam: (
    <svg
      className="icon-sm"
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
  mailC: (
    <svg
      className="icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
      <path d="m16 13 2 2 4-4" />
    </svg>
  ),
};

function MToast({ text, onDone }) {
  _msUseEffectM(() => {
    if (!text) return;
    const t = setTimeout(() => onDone && onDone(), 1600);
    return () => clearTimeout(t);
  }, [text]);
  if (!text) return null;
  return <div className="m-toast">{text}</div>;
}

// ─────────────────────────────────────────────
//  Stats screen
// ─────────────────────────────────────────────
function StatsScreen({ onBack }) {
  // 26-column grid (~2 weeks per column) over 52 weeks
  const today = new Date(2025, 10, 18);
  const yearStart = new Date(2025, 0, 1);
  const dayOfYear = Math.floor((today - yearStart) / 86400000);
  const cells = [];
  for (let week = 0; week < 26; week++) {
    for (let row = 0; row < 14; row++) {
      const idx = week * 14 + row;
      const isFuture = idx > dayOfYear;
      const intensity = Math.sin(idx / 7) * 0.5 + Math.cos(idx / 4) * 0.3 + 0.5;
      const isRead = !isFuture && intensity > 0.35;
      let lvl = 0;
      if (isRead) {
        if (intensity > 0.85) lvl = 4;
        else if (intensity > 0.7) lvl = 3;
        else if (intensity > 0.55) lvl = 2;
        else lvl = 1;
      }
      cells.push({ idx, isFuture, lvl });
    }
  }
  return (
    <div className="m-statspage" data-screen-label="11 Stats">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {MmIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>독서 기록</div>
        <div style={{ width: 30 }} />
      </div>

      <div className="m-stats-hero">
        <div className="yr">2025년</div>
        <div className="bignum">
          47<small>권 완독</small>
        </div>
        <div className="sub">이번 해 312개의 한 줄을 담았어요. 작년보다 14권 더.</div>
      </div>

      <div className="m-stats-row">
        <div className="m-stats-card">
          <div className="v">
            14<small>일</small>
          </div>
          <div className="l">현재 연속</div>
        </div>
        <div className="m-stats-card">
          <div className="v">
            {Math.round(312 / 47)}
            <small>개</small>
          </div>
          <div className="l">책당 한 줄</div>
        </div>
        <div className="m-stats-card">
          <div className="v">
            312<small>개</small>
          </div>
          <div className="l">한 줄</div>
        </div>
      </div>

      <div className="m-yearcal">
        <div className="h">2025년 캘린더</div>
        <div className="grid">
          {cells.map((c) => {
            const cls = ['cd'];
            if (c.isFuture) cls.push('is-future');
            else if (c.lvl > 0) cls.push('l' + c.lvl);
            return <div key={c.idx} className={cls.join(' ')} />;
          })}
        </div>
        <div className="lg">
          <span>적게</span>
          <span className="sw l0" />
          <span className="sw l1" />
          <span className="sw l2" />
          <span className="sw l3" />
          <span>많이</span>
        </div>
      </div>

      <div className="m-genre">
        <div className="h">가장 많이 읽은 장르</div>
        {[
          { l: '한국 소설', n: 18, p: 38 },
          { l: '에세이', n: 12, p: 26 },
          { l: '시', n: 7, p: 15 },
          { l: '인문', n: 6, p: 13 },
          { l: '비소설', n: 4, p: 8 },
        ].map((g, i) => (
          <div key={i} className="m-bar">
            <div className="l">{g.l}</div>
            <div className="t">
              <i style={{ width: g.p + '%' }} />
            </div>
            <div className="n">{g.n}권</div>
          </div>
        ))}
      </div>

      <div className="m-genre">
        <div className="h">사랑한 작가</div>
        {[
          { n: '김연수', q: 28, b: 4 },
          { n: '김애란', q: 22, b: 3 },
          { n: '이현우', q: 18, b: 2 },
          { n: '이도우', q: 11, b: 2 },
        ].map((a, i) => (
          <div key={i} className="m-bar" style={{ gridTemplateColumns: '80px 1fr auto' }}>
            <div className="l">{a.n}</div>
            <div className="t">
              <i style={{ width: (a.q / 28) * 100 + '%' }} />
            </div>
            <div className="n">
              {a.b}권 · {a.q}줄
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ShareSheet — bottom sheet for quote/book
// ─────────────────────────────────────────────
function ShareSheet({ open, mode, payload, onClose }) {
  const [toast, setToast] = _msUseStateM('');
  if (!open) return null;

  const onShare = (k) => {
    if (k === 'copy') setToast('링크를 복사했어요');
    else if (k === 'image') setToast('이미지로 저장 중…');
    else setToast(k + ' 공유창을 열었어요');
  };

  const preview =
    mode === 'quote' ? (
      <div className="preview q">
        <div className="qt">"{payload?.t || '한 줄'}"</div>
        <div className="qm">
          <b>{payload?.a || '작가'}</b> · {payload?.b || '책 제목'} · {payload?.p || ''}
        </div>
      </div>
    ) : (
      <div className="preview b">
        <div
          className="cv"
          style={{ background: payload?.bg || 'linear-gradient(155deg,#3F6750,#1F4030)' }}
        >
          {payload?.t || '책'}
        </div>
        <div className="info">
          <div className="t">{payload?.t || '책 제목'}</div>
          <div className="a">{payload?.a || '작가'}</div>
        </div>
      </div>
    );

  const plats = [
    { k: 'kakao', l: '카카오톡', ico: 'K', cls: 'kakao' },
    { k: 'msg', l: '메시지', icon: MmIc.msg, cls: 'message' },
    { k: 'x', l: 'X', ico: '𝕏', cls: 'x' },
    { k: 'thread', l: '스레드', ico: '@', cls: 'thread' },
    { k: 'mail', l: '이메일', icon: MmIc.mail, cls: 'email' },
    { k: 'image', l: '이미지', icon: MmIc.image, cls: 'image' },
    { k: 'copy', l: '링크 복사', icon: MmIc.link, cls: 'copy' },
    { k: 'system', l: '더보기', icon: MmIc.more, cls: 'system' },
  ];

  return (
    <div className="m-sheet-scrim" onClick={onClose}>
      <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="h">{mode === 'quote' ? '한 줄 공유' : '책 공유'}</div>
        {preview}
        <div className="m-share-grid">
          {plats.map((p) => (
            <button key={p.k} className="m-share-btn" onClick={() => onShare(p.k)}>
              <span className={'ic ' + p.cls}>{p.icon || p.ico}</span>
              <span className="lb">{p.l}</span>
            </button>
          ))}
        </div>
        <div className="m-sheet-actions">
          <button className="m-sheet-action">
            <span className="ic">{MmIc.copy}</span>
            <span style={{ flex: 1 }}>텍스트만 복사</span>
          </button>
          <button className="m-sheet-action">
            <span className="ic">{MmIc.image}</span>
            <span style={{ flex: 1 }}>한 장 이미지로 만들기</span>
          </button>
        </div>
        <MToast text={toast} onDone={() => setToast('')} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  QuoteDetailScreen
// ─────────────────────────────────────────────
function QuoteDetailScreen({ onBack, onShare, onNotify, q }) {
  const [pinned, setPinned] = _msUseStateM(false);
  const quote = q || {
    t: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
    a: '김연수',
    b: '일곱 해의 마지막',
    p: 'p.42',
  };
  return (
    <div className="m-qdetail" data-screen-label="12 Quote Detail">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {MmIc.back}
        </button>
        <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>한 줄</div>
        <button
          style={{ background: 'transparent', padding: 6 }}
          onClick={onShare}
          aria-label="공유"
        >
          {MmIc.share}
        </button>
      </div>

      <div className="body">
        <div className="mark">"</div>
        <div className="qt">{quote.t}</div>
        <div className="src">
          <div className="b">{quote.b}</div>
          <div className="a">{quote.a}</div>
          <div className="p">{quote.p} · 3일 전</div>
        </div>
      </div>

      <div className="actions">
        <button onClick={() => setPinned((v) => !v)} className={pinned ? 'on' : ''}>
          {MmIc.pin}
          {pinned ? '고정됨' : '홈에 고정'}
        </button>
        <button onClick={() => onNotify && onNotify('수정 모드를 열었어요')}>
          {MmIc.edit}
          수정
        </button>
      </div>

      <div className="tags">
        <button className="chip on">#한국문학</button>
        <button className="chip">#문장수집</button>
        <button className="chip">#밑줄</button>
        <button
          className="chip"
          style={{
            background: 'transparent',
            border: '1px dashed var(--divider-strong)',
            color: 'var(--fg-3)',
          }}
        >
          + 태그
        </button>
      </div>

      <div className="meta-list">
        <div className="row">
          <div className="l">담은 날짜</div>
          <div className="v">2025-11-15</div>
        </div>
        <div className="row">
          <div className="l">페이지</div>
          <div className="v">{quote.p}</div>
        </div>
        <div className="row">
          <div className="l">방식</div>
          <div className="v">사진 인식</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ForgotPasswordScreen
// ─────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = _msUseStateM('');
  const [sent, setSent] = _msUseStateM(false);
  return (
    <div className="m-fp" data-screen-label="13 Forgot Password">
      <div className="topbar">
        <button onClick={onBack}>{MmIc.back}</button>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="mark">책담</div>
      </div>

      {!sent ? (
        <>
          <h2>비밀번호를 잊으셨군요</h2>
          <div className="sub">
            계정에 연결된 이메일을 알려주시면,
            <br />
            비밀번호를 다시 설정할 수 있는 링크를 보내드릴게요.
          </div>
          <label className="field">
            <span>이메일</span>
            <input
              type="email"
              className="input"
              placeholder="reader@chaekdam.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="cta" disabled={!email} onClick={() => setSent(true)}>
            재설정 링크 보내기
          </button>
          <div className="switch">
            계정이 기억나지 않으세요?{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              도움말
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="success">
            <div className="t">{MmIc.mailC} 이메일을 보냈어요</div>
            <div className="s">
              <b>{email}</b>(으)로 비밀번호 재설정 링크를 보내드렸어요. 스팸함도 함께 확인해 주세요.
              링크는 30분 동안 유효해요.
            </div>
          </div>
          <button
            className="cta"
            style={{
              background: 'transparent',
              color: 'var(--ink-700)',
              border: '1px solid var(--divider-strong)',
            }}
            onClick={() => setSent(false)}
          >
            다른 이메일로 다시 보내기
          </button>
          <div className="switch">
            메일을 받으셨다면{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBack && onBack();
              }}
            >
              로그인으로 돌아가기
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  ProfileEditScreen
// ─────────────────────────────────────────────
function ProfileEditScreen({ onBack }) {
  const [name, setName] = _msUseStateM('홍길동');
  const [bio, setBio] = _msUseStateM('3년차 UI/UX 디자이너 · 종이책 애호가');
  return (
    <div className="m-pedit" data-screen-label="14 Profile Edit">
      <div className="topbar">
        <button onClick={onBack} style={{ background: 'transparent', padding: 6 }}>
          {MmIc.x}
        </button>
        <div className="title">프로필 수정</div>
        <button className="save" onClick={onBack}>
          저장
        </button>
      </div>

      <div className="ar-row">
        <div className="av">
          홍<span className="edit">{MmIc.cam}</span>
        </div>
        <button className="change">사진 변경</button>
      </div>

      <div className="sec-lbl">계정</div>
      <div className="group">
        <div className="row">
          <div className="lbl">이름</div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="row">
          <div className="lbl">이메일</div>
          <input defaultValue="reader@chaekdam.kr" disabled style={{ color: 'var(--fg-3)' }} />
        </div>
        <div className="row">
          <div className="lbl">한 줄 소개</div>
          <textarea rows="2" value={bio} maxLength={80} onChange={(e) => setBio(e.target.value)} />
          <div className="count">{bio.length}/80</div>
        </div>
      </div>

      <div className="sec-lbl">위험</div>
      <div className="group">
        <div className="row danger">로그아웃</div>
        <div className="row danger" style={{ borderBottom: 0 }}>
          계정 탈퇴
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  StatsScreen,
  ShareSheet,
  QuoteDetailScreen,
  ForgotPasswordScreen,
  ProfileEditScreen,
  MToast,
});
