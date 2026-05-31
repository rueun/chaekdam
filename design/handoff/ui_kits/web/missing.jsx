// Chaekdam web UI kit — missing screens / modals
// Adds: SearchDialog (global keyword search), ShareDialog (quote+book
// share sheet), QuoteMenu (more-horizontal popover), NewChatDialog
// (book picker for AI talk), ProfileEditDialog, ConfirmDialog, and
// PageForgotPassword.

const { useState: _msUseState, useEffect: _msUseEffect, useRef: _msUseRef } = React;

// Tiny utility — copy text to clipboard, fall back silently
function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(t).catch(() => {});
  }
  return Promise.resolve();
}

// Lightweight toast (auto-dismisses)
function Toast({ text, onDone }) {
  _msUseEffect(() => {
    if (!text) return;
    const t = setTimeout(() => onDone && onDone(), 1600);
    return () => clearTimeout(t);
  }, [text]);
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

// ───────────────────────────────────────────────────────────
//  SearchDialog — global keyword search (TopBar search input)
// ───────────────────────────────────────────────────────────
const GS_BOOKS = [
  {
    t: '일곱 해의 마지막',
    a: '김연수',
    meta: '한국 소설 · 읽는 중 · 현재 p.234',
    bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
  },
  {
    t: '아주 사적인 독서',
    a: '이현우',
    meta: '에세이 · 완독 · ★ 4.5',
    bg: 'linear-gradient(155deg,#6B8C5F,#4A6741)',
  },
  {
    t: '바깥은 여름',
    a: '김애란',
    meta: '한국 소설 · 완독 · ★ 5.0',
    bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
  },
  {
    t: '문구의 모험',
    a: '고로다 슈이치',
    meta: '에세이 · 읽는 중 · 현재 p.128',
    bg: 'linear-gradient(155deg,#D9963D,#86571B)',
  },
];
const GS_QUOTES = [
  {
    t: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
    a: '김연수',
    b: '일곱 해의 마지막',
    p: 'p.42',
  },
  {
    t: '독서는 결국 자기 자신과의 가장 오래된 대화이고, 가장 천천히 답이 도착하는 편지이다.',
    a: '이현우',
    b: '아주 사적인 독서',
    p: 'p.118',
  },
  {
    t: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다.',
    a: '김애란',
    b: '바깥은 여름',
    p: 'p.94',
  },
];
const GS_AUTHORS = [
  { n: '김연수', m: '4권 · 한 줄 28개' },
  { n: '김애란', m: '3권 · 한 줄 22개' },
  { n: '이현우', m: '2권 · 한 줄 18개' },
];
const GS_RECENT = ['김연수', '에세이', '독서', 'p.42'];

function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text
    .split(re)
    .map((part, i) =>
      i % 2 === 1 ? <mark key={i}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>,
    );
}

function SearchDialog({ open, onClose, onPickBook, onOpenQuotes }) {
  const [q, setQ] = _msUseState('');
  const [scope, setScope] = _msUseState('all');
  const inputRef = _msUseRef(null);

  _msUseEffect(() => {
    if (open) {
      setQ('');
      setScope('all');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
      lucide.createIcons();
    }
  }, [open]);
  _msUseEffect(() => {
    if (open) lucide.createIcons();
  }, [open, q, scope]);

  if (!open) return null;

  const ql = q.toLowerCase().trim();
  const matchBooks = !ql
    ? []
    : GS_BOOKS.filter(
        (b) =>
          b.t.toLowerCase().includes(ql) ||
          b.a.toLowerCase().includes(ql) ||
          b.meta.toLowerCase().includes(ql),
      );
  const matchQuotes = !ql
    ? []
    : GS_QUOTES.filter(
        (qu) =>
          qu.t.toLowerCase().includes(ql) ||
          qu.a.toLowerCase().includes(ql) ||
          qu.b.toLowerCase().includes(ql),
      );
  const matchAuthors = !ql ? [] : GS_AUTHORS.filter((a) => a.n.toLowerCase().includes(ql));
  const totalHits = matchBooks.length + matchQuotes.length + matchAuthors.length;
  const showBooks = !ql || scope === 'all' || scope === 'books';
  const showQuotes = !ql || scope === 'all' || scope === 'quotes';
  const showAuthors = !ql || scope === 'all' || scope === 'authors';

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="gs-bar">
          <div className="gs-input">
            <Icon name="search" className="icon" style={{ color: 'var(--fg-3)' }} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="책, 작가, 한 줄을 검색해 보세요"
              onKeyDown={(e) => e.key === 'Escape' && onClose()}
            />
            {q && (
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setQ('')}
                aria-label="지우기"
              >
                <Icon name="x" className="icon icon-sm" />
              </button>
            )}
            <span className="gs-kbd">esc</span>
          </div>
        </div>

        <div className="gs-scope">
          {[
            ['all', '전체'],
            ['books', '책'],
            ['quotes', '한 줄'],
            ['authors', '작가'],
          ].map(([k, l]) => (
            <button
              key={k}
              className={'chip ' + (scope === k ? 'is-active' : '')}
              onClick={() => setScope(k)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="gs-body">
          {!ql && (
            <>
              <div className="gs-section">
                <div className="gs-section-h">
                  최근 검색
                  <button
                    className="gs-meta"
                    style={{ background: 'transparent', fontSize: 11, color: 'var(--fg-3)' }}
                  >
                    지우기
                  </button>
                </div>
                <div className="gs-recent" style={{ padding: '0 4px' }}>
                  {GS_RECENT.map((r) => (
                    <button key={r} className="chip chip-sm" onClick={() => setQ(r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="gs-section">
                <div className="gs-section-h">최근 본 책</div>
                {GS_BOOKS.slice(0, 3).map((b, i) => (
                  <div
                    key={i}
                    className="gs-row"
                    onClick={() => {
                      onPickBook && onPickBook(b);
                      onClose();
                    }}
                  >
                    <div className="gs-ico book" style={{ background: b.bg }}>
                      {b.t.slice(0, 3)}
                    </div>
                    <div>
                      <div className="gs-tt">{b.t}</div>
                      <div className="gs-sub">
                        {b.a} · {b.meta}
                      </div>
                    </div>
                    <div className="gs-meta">↵</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {ql && totalHits === 0 && (
            <div className="gs-empty">
              <Icon
                name="search-x"
                className="icon"
                style={{ width: 32, height: 32, color: 'var(--ink-500)' }}
              />
              <div className="t">"{q}"에 대한 결과가 없어요</div>
              <div className="s">다른 키워드나 작가 이름으로 검색해 보세요.</div>
            </div>
          )}

          {ql && showBooks && matchBooks.length > 0 && (
            <div className="gs-section">
              <div className="gs-section-h">
                책<span className="n">{matchBooks.length}</span>
              </div>
              {matchBooks.map((b, i) => (
                <div
                  key={i}
                  className="gs-row"
                  onClick={() => {
                    onPickBook && onPickBook(b);
                    onClose();
                  }}
                >
                  <div className="gs-ico book" style={{ background: b.bg }}>
                    {b.t.slice(0, 3)}
                  </div>
                  <div>
                    <div className="gs-tt">{highlight(b.t, q)}</div>
                    <div className="gs-sub">
                      {highlight(b.a, q)} · {b.meta}
                    </div>
                  </div>
                  <div className="gs-meta">↵</div>
                </div>
              ))}
            </div>
          )}

          {ql && showQuotes && matchQuotes.length > 0 && (
            <div className="gs-section">
              <div className="gs-section-h">
                한 줄<span className="n">{matchQuotes.length}</span>
              </div>
              {matchQuotes.map((qu, i) => (
                <div
                  key={i}
                  className="gs-row"
                  onClick={() => {
                    onOpenQuotes && onOpenQuotes();
                    onClose();
                  }}
                >
                  <div className="gs-ico">
                    <Icon name="quote" className="icon icon-sm" />
                  </div>
                  <div>
                    <div className="gs-quote-text">"{highlight(qu.t, q)}"</div>
                    <div className="gs-sub">
                      {highlight(qu.a, q)} · {qu.b} · {qu.p}
                    </div>
                  </div>
                  <div className="gs-meta">↵</div>
                </div>
              ))}
            </div>
          )}

          {ql && showAuthors && matchAuthors.length > 0 && (
            <div className="gs-section">
              <div className="gs-section-h">
                작가<span className="n">{matchAuthors.length}</span>
              </div>
              {matchAuthors.map((a, i) => (
                <div key={i} className="gs-row">
                  <div className="gs-ico">
                    <Icon name="user-round" className="icon icon-sm" />
                  </div>
                  <div>
                    <div className="gs-tt">{highlight(a.n, q)}</div>
                    <div className="gs-sub">{a.m}</div>
                  </div>
                  <div className="gs-meta">↵</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="gs-foot">
          <div className="hints">
            <span className="hint">
              <span className="kbd">↑↓</span>이동
            </span>
            <span className="hint">
              <span className="kbd">↵</span>열기
            </span>
            <span className="hint">
              <span className="kbd">esc</span>닫기
            </span>
          </div>
          <span>책담 전체 검색</span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  ShareDialog — quote or book share sheet
// ───────────────────────────────────────────────────────────
function ShareDialog({ open, mode, payload, onClose }) {
  // mode: 'quote' | 'book'
  const [toast, setToast] = _msUseState('');
  _msUseEffect(() => {
    if (open) lucide.createIcons();
  }, [open]);
  if (!open) return null;

  const url =
    mode === 'quote'
      ? 'https://chaekdam.kr/q/' +
        (payload && payload.p ? payload.p.replace('.', '-') : 'abc12') +
        '-' +
        (payload && payload.a ? encodeURIComponent(payload.a) : 'x')
      : 'https://chaekdam.kr/book/' + (payload && payload.t ? encodeURIComponent(payload.t) : 'x');

  const sharePreview =
    mode === 'quote' ? (
      <div className="share-preview quote-style">
        <div
          className="pq"
          dangerouslySetInnerHTML={{ __html: '"' + (payload?.t || '한 줄') + '"' }}
        />
        <div className="pm">
          <b>{payload?.a || '작가'}</b> · {payload?.b || '책 제목'} · {payload?.p || ''}
        </div>
      </div>
    ) : (
      <div className="share-preview book-style">
        <div className="pcover" style={{ background: payload?.bg || 'var(--ink-700)' }}>
          {payload?.t || '책 제목'}
        </div>
        <div className="pinfo">
          <div className="tt">{payload?.t || '책 제목'}</div>
          <div className="ph">
            {payload?.a || '작가'} · {payload?.meta || ''}
          </div>
          <div className="pl">
            <Icon name="link" className="icon icon-sm" />
            {url}
          </div>
        </div>
      </div>
    );

  const platforms = [
    { k: 'kakao', l: '카카오', ico: 'K' },
    { k: 'x', l: 'X', ico: '𝕏' },
    { k: 'thread', l: '스레드', ico: '@' },
    { k: 'email', l: '이메일', icon: 'mail' },
    { k: 'image', l: '이미지', icon: 'image-down' },
    { k: 'embed', l: '임베드', icon: 'code-2' },
    { k: 'print', l: '인쇄', icon: 'printer' },
    { k: 'copy', l: '링크 복사', icon: 'link' },
  ];

  const onShare = (p) => {
    if (p === 'copy') {
      copyText(url);
      setToast('링크를 복사했어요');
    } else if (p === 'image') {
      setToast('이미지로 저장 중…');
    } else {
      setToast(p.toUpperCase() + ' 공유창을 열었어요');
    }
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal share-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">공유</div>
            <h2 className="modal-title">{mode === 'quote' ? '한 줄 공유' : '책 공유'}</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
            <Icon name="x" className="icon" />
          </button>
        </div>

        {sharePreview}

        <div className="share-grid">
          {platforms.map((p) => (
            <button key={p.k} className="share-btn" onClick={() => onShare(p.k)}>
              <span className={'ico ' + (p.k === 'thread' ? 'thread' : p.k)}>
                {p.icon ? (
                  <Icon name={p.icon} className="icon icon-sm" style={{ color: 'inherit' }} />
                ) : (
                  p.ico
                )}
              </span>
              <span className="lbl">{p.l}</span>
            </button>
          ))}
        </div>

        <div className="share-link">
          <Icon name="link" className="icon icon-sm" style={{ color: 'var(--fg-3)' }} />
          <input readOnly value={url} />
          <button
            onClick={() => {
              copyText(url);
              setToast('링크를 복사했어요');
            }}
          >
            복사
          </button>
        </div>

        <Toast text={toast} onDone={() => setToast('')} />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  QuoteMenu — more-horizontal popover
// ───────────────────────────────────────────────────────────
function QuoteMenu({ open, anchor, onClose, onEdit, onPin, onDelete }) {
  _msUseEffect(() => {
    if (open) lucide.createIcons();
  }, [open]);
  if (!open || !anchor) return null;
  // Position below the anchor element
  const rect = anchor.getBoundingClientRect
    ? anchor.getBoundingClientRect()
    : { right: 0, bottom: 0 };
  const style = {
    top: Math.min(window.innerHeight - 280, rect.bottom + 6),
    left: Math.min(window.innerWidth - 252, Math.max(8, rect.right - 240)),
  };
  const handle = (fn) => () => {
    onClose();
    fn && fn();
  };
  return (
    <>
      <div className="qmenu-scrim" onClick={onClose} />
      <div className="qmenu" style={style} role="menu">
        <button className="qmenu-row" onClick={handle(onEdit)}>
          <Icon name="pen-line" className="icon icon-sm" />
          문장 수정
        </button>
        <button className="qmenu-row" onClick={handle(onPin)}>
          <Icon name="pin" className="icon icon-sm" />
          홈에 고정
        </button>
        <button className="qmenu-row" onClick={handle(() => copyText('quote text'))}>
          <Icon name="copy" className="icon icon-sm" />
          텍스트 복사
          <span className="kbd">⌘C</span>
        </button>
        <div className="qmenu-sep" />
        <button className="qmenu-row" onClick={handle(() => {})}>
          <Icon name="folder-input" className="icon icon-sm" />
          다른 책으로 이동
        </button>
        <button className="qmenu-row" onClick={handle(() => {})}>
          <Icon name="archive" className="icon icon-sm" />
          보관함에 넣기
        </button>
        <div className="qmenu-sep" />
        <button className="qmenu-row is-danger" onClick={handle(onDelete)}>
          <Icon name="trash-2" className="icon icon-sm" />한 줄 삭제
        </button>
      </div>
    </>
  );
}

// ───────────────────────────────────────────────────────────
//  NewChatDialog — start a new AI discussion
// ───────────────────────────────────────────────────────────
function NewChatDialog({ open, onClose, onStart }) {
  const [bookIx, setBookIx] = _msUseState(0);
  const [style, setStyle] = _msUseState('socrates');
  _msUseEffect(() => {
    if (open) {
      setBookIx(0);
      setStyle('socrates');
      lucide.createIcons();
    }
  }, [open]);
  if (!open) return null;

  const books = [
    {
      t: '일곱 해의 마지막',
      a: '김연수',
      pill: '읽는 중',
      bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
    },
    {
      t: '사서함 110호의 우편물',
      a: '이도우',
      pill: '읽는 중',
      bg: 'linear-gradient(155deg,#45403A,#1F1A15)',
    },
    {
      t: '문구의 모험',
      a: '고로다 슈이치',
      pill: '읽는 중',
      bg: 'linear-gradient(155deg,#D9963D,#86571B)',
    },
    {
      t: '바깥은 여름',
      a: '김애란',
      pill: '완독 5월 7일',
      bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
    },
    {
      t: '아주 사적인 독서',
      a: '이현우',
      pill: '완독 4월 22일',
      bg: 'linear-gradient(155deg,#6B8C5F,#4A6741)',
    },
  ];

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal newchat-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">AI 독서토론</div>
            <h2 className="modal-title">어떤 책에 대해 이야기할까요?</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
            <Icon name="x" className="icon" />
          </button>
        </div>

        <p className="nc-intro">
          책담의 토론자가 천천히 질문을 건네드려요. 읽는 중인 책이라면 밑줄 그은 문장부터 시작해
          볼게요.
        </p>

        <div className="nc-section-h">책 선택</div>
        <div className="nc-book-list">
          {books.map((b, i) => (
            <div
              key={i}
              className={'nc-book ' + (bookIx === i ? 'is-active' : '')}
              onClick={() => setBookIx(i)}
            >
              <div className="cv" style={{ background: b.bg }}>
                {b.t.slice(0, 4)}
              </div>
              <div className="info">
                <div className="t">{b.t}</div>
                <div className="a">{b.a}</div>
              </div>
              <span className="pill">{b.pill}</span>
            </div>
          ))}
        </div>

        <div className="nc-section-h">토론자</div>
        <p className="nc-persona-note">
          <Icon name="lock" className="icon icon-sm" />
          <span>
            대화를 시작한 뒤에는 토론자를 바꿀 수 없어요. 한 대화방에서는 한 명과 깊이 이야기해요.
          </span>
        </p>
        <div className="nc-persona-list">
          {[
            { k: 'socrates', tt: '소크라테스', ss: '답 대신 질문을 건네요', ico: 'help-circle' },
            { k: 'critic', tt: '비평가', ss: '구조와 문체를 짚어줘요', ico: 'scan-text' },
            {
              k: 'author',
              tt: '작가 본인',
              ss: '인터뷰·서신에서 학습한 톤',
              ico: 'feather',
              disabled: true,
              hint: '이 책은 작가가 생존해 있어요',
            },
            { k: 'friend', tt: '책 동무', ss: '분석하지 않고 같이 반응해요', ico: 'coffee' },
          ].map((o) => (
            <label
              key={o.k}
              className={
                'nc-persona ' +
                (style === o.k ? 'on' : '') +
                ' ' +
                (o.disabled ? 'is-disabled' : '')
              }
              onClick={() => {
                if (!o.disabled) setStyle(o.k);
              }}
              title={o.disabled ? o.hint : ''}
            >
              <div className="nc-persona-ic">
                <Icon name={o.ico} className="icon" />
              </div>
              <div className="nc-persona-meta">
                <div className="tt">{o.tt}</div>
                <div className="ss">{o.disabled ? o.hint : o.ss}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="nc-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onStart && onStart(books[bookIx], style);
              onClose();
            }}
          >
            <Icon name="sparkles" className="icon icon-sm" />
            대화 시작
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  ProfileEditDialog
// ───────────────────────────────────────────────────────────
function ProfileEditDialog({ open, onClose }) {
  const [bio, setBio] = _msUseState('3년차 UI/UX 디자이너 · 종이책 애호가');
  _msUseEffect(() => {
    if (open) lucide.createIcons();
  }, [open]);
  if (!open) return null;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal profile-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">계정</div>
            <h2 className="modal-title">프로필 수정</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
            <Icon name="x" className="icon" />
          </button>
        </div>

        <div className="pe-avatar-row">
          <div className="pe-avatar">
            홍
            <span className="edit">
              <Icon name="pen-line" className="icon icon-sm" />
            </span>
          </div>
          <div className="pe-avatar-help">
            <b>프로필 사진</b>
            JPG · PNG · 최대 4MB. 정사각형으로 자동 자릅니다.
          </div>
        </div>

        <div className="pe-fields">
          <label>
            <span>이름</span>
            <input className="input" defaultValue="홍길동" />
          </label>
          <label>
            <span>한 줄 소개</span>
            <textarea
              className="pe-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={80}
            />
            <span
              style={{
                fontSize: 11,
                color: 'var(--fg-3)',
                textAlign: 'right',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {bio.length}/80
            </span>
          </label>
        </div>

        <div className="pe-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            <Icon name="check" className="icon icon-sm" />
            변경 저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  ConfirmDialog — destructive action confirm
// ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, body, confirmText, requireType, onConfirm, onClose }) {
  const [typed, setTyped] = _msUseState('');
  _msUseEffect(() => {
    if (open) {
      setTyped('');
      lucide.createIcons();
    }
  }, [open]);
  if (!open) return null;
  const canConfirm = !requireType || typed === requireType;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <Icon name="alert-triangle" className="icon" />
        </div>
        <h2 className="modal-title" style={{ marginBottom: 8 }}>
          {title || '정말 진행할까요?'}
        </h2>
        <div className="confirm-body">{body}</div>
        {requireType && (
          <div className="confirm-input">
            <div className="help">
              계속하려면 <b>{requireType}</b>(을)를 그대로 입력해 주세요
            </div>
            <input
              className="input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireType}
            />
          </div>
        )}
        <div className="confirm-foot" style={{ marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={onClose}>
            취소
          </button>
          <button
            className="btn btn-danger"
            disabled={!canConfirm}
            style={!canConfirm ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={() => {
              onConfirm && onConfirm();
              onClose();
            }}
          >
            {confirmText || '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  PageForgotPassword — auth sub-screen
// ───────────────────────────────────────────────────────────
function PageForgotPassword({ onBack }) {
  const [email, setEmail] = _msUseState('');
  const [sent, setSent] = _msUseState(false);
  _msUseEffect(() => {
    lucide.createIcons();
  }, [sent]);

  return (
    <div className="auth-page" data-screen-label="web · forgot">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <button className="auth-back" onClick={onBack}>
            <Icon name="chevron-left" className="icon icon-sm" />
            로그인으로
          </button>

          <div className="auth-brand-mark">
            <span className="wm">책담</span>
            <span className="tag">Chaekdam</span>
          </div>

          {!sent ? (
            <>
              <h1 className="auth-title">비밀번호를 잊으셨군요</h1>
              <p className="auth-sub">
                계정에 연결된 이메일을 알려주시면, 비밀번호를 다시 설정할 수<br />
                있는 링크를 보내드릴게요.
              </p>

              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <label className="auth-field">
                  <span>이메일</span>
                  <input
                    type="email"
                    className="input"
                    placeholder="reader@chaekdam.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary auth-cta"
                  disabled={!email}
                  style={!email ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  재설정 링크 보내기
                </button>
              </form>

              <div className="auth-switch">
                계정이 기억나지 않으세요?
                <a href="#" onClick={(e) => e.preventDefault()}>
                  {' '}
                  도움말
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="fp-success">
                <div className="t">
                  <Icon name="mail-check" className="icon icon-sm" />
                  이메일을 보냈어요
                </div>
                <div className="s">
                  <b>{email}</b>(으)로 비밀번호 재설정 링크를 보내드렸어요. 메일이 보이지 않는다면
                  스팸함도 확인해 주세요. 링크는 30분 동안 유효해요.
                </div>
              </div>

              <button
                className="btn btn-secondary auth-cta"
                onClick={() => setSent(false)}
                style={{ marginTop: 0 }}
              >
                다른 이메일로 다시 보내기
              </button>

              <div className="auth-switch">
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
      </div>
    </div>
  );
}

Object.assign(window, {
  SearchDialog,
  ShareDialog,
  QuoteMenu,
  NewChatDialog,
  ProfileEditDialog,
  ConfirmDialog,
  PageForgotPassword,
  Toast,
});
