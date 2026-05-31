// Chaekdam · Auth pages (web)
// Login + Signup. OAuth via Google + Kakao. Editorial split layout:
// left = brand statement (literary), right = form panel.

const { useState: _authUseState } = React;

// ─────────────────────────────────────────────
//  Brand pane — shared between login + signup
// ─────────────────────────────────────────────
function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="auth-mark">책담</div>
      <div className="auth-quote">
        <p>
          "아주 천천히 책장을 넘기는 사람만이
          <br />
          어떤 문장이 자신의 것인지 알아본다."
        </p>
        <div className="cite">김연수, 일곱 해의 마지막</div>
      </div>
      <div className="auth-tag">한 줄을 담아두는 곳</div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  OAuth buttons (Google + Kakao)
// ─────────────────────────────────────────────
function NaverLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFFFFF" d="M14.4 12.6L9.3 5H4v14h5.6V11.4L14.7 19H20V5h-5.6v7.6z" />
    </svg>
  );
}
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.5-1.9 12.9-5l-5.9-5c-2 1.4-4.4 2.3-7 2.3-5.2 0-9.6-3.3-11.2-8l-6.6 5C9.5 39.6 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l5.9 5c-.4.4 6.8-4.9 6.8-14.5 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
function KakaoLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="#000"
        d="M16 6C8.8 6 3 10.5 3 16.1c0 3.5 2.3 6.6 5.8 8.4-.3 1-1 3.7-1.2 4.4-.2.8.3.8.6.6.3-.2 4.2-2.8 5.9-4 .6.1 1.2.1 1.9.1 7.2 0 13-4.5 13-10.1S23.2 6 16 6z"
      />
    </svg>
  );
}

function OAuthButtons({ mode }) {
  const verb = mode === 'signup' ? '시작' : '로그인';
  return (
    <div className="auth-oauth">
      <button className="auth-btn auth-btn-kakao">
        <span className="logo">
          <KakaoLogo />
        </span>
        카카오로 {verb}
      </button>
      <button className="auth-btn auth-btn-naver">
        <span className="logo">
          <NaverLogo />
        </span>
        네이버로 {verb}
      </button>
      <button className="auth-btn auth-btn-google">
        <span className="logo">
          <GoogleLogo />
        </span>
        Google로 {verb}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Login page
// ─────────────────────────────────────────────
function PageLogin({ onSwitch, onForgot }) {
  const [email, setEmail] = _authUseState('');
  const [pw, setPw] = _authUseState('');
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-brand-mark">
            <span className="wm">책담</span>
            <span className="tag">Chaekdam</span>
          </div>
          <h1 className="auth-title">다시 만나서 반가워요</h1>
          <p className="auth-sub">어제 그어둔 한 줄이 기다리고 있어요.</p>

          <OAuthButtons mode="login" />

          <div className="auth-divider">
            <span>또는 이메일로</span>
          </div>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <label className="auth-field">
              <span>이메일</span>
              <input
                type="email"
                className="input"
                placeholder="reader@chaekdam.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>비밀번호</span>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <a
                href="#"
                className="auth-forgot"
                onClick={(e) => {
                  e.preventDefault();
                  onForgot && onForgot();
                }}
              >
                잊어버리셨나요?
              </a>
            </label>

            <button type="submit" className="btn btn-primary auth-cta">
              로그인
            </button>
          </form>

          <div className="auth-switch">
            아직 책담 계정이 없으세요?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitch && onSwitch();
              }}
            >
              {' '}
              회원가입
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Signup page
// ─────────────────────────────────────────────
function PageSignup({ onSwitch }) {
  const [step, setStep] = _authUseState(0); // 0 = main form, 1 = email submitted preview
  const [form, setForm] = _authUseState({ name: '', email: '', pw: '', pw2: '' });
  const [agree, setAgree] = _authUseState({ tos: false, privacy: false, marketing: false });

  const setF = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const setA = (k) => (e) => setAgree((prev) => ({ ...prev, [k]: e.target.checked }));
  const allRequired = agree.tos && agree.privacy;

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-brand-mark">
            <span className="wm">책담</span>
            <span className="tag">Chaekdam</span>
          </div>
          <h1 className="auth-title">한 줄을 담을 자리를 만들어요</h1>
          <p className="auth-sub">3분이면 시작할 수 있어요. 책담은 광고와 추적이 없어요.</p>

          <OAuthButtons mode="signup" />

          <div className="auth-divider">
            <span>또는 이메일로</span>
          </div>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <label className="auth-field">
              <span>이름</span>
              <input
                type="text"
                className="input"
                placeholder="책담에서 부를 이름"
                value={form.name}
                onChange={setF('name')}
              />
            </label>
            <label className="auth-field">
              <span>이메일</span>
              <input
                type="email"
                className="input"
                placeholder="reader@chaekdam.kr"
                value={form.email}
                onChange={setF('email')}
              />
            </label>
            <div className="auth-field-row">
              <label className="auth-field">
                <span>비밀번호</span>
                <input
                  type="password"
                  className="input"
                  placeholder="8자 이상"
                  value={form.pw}
                  onChange={setF('pw')}
                />
              </label>
              <label className="auth-field">
                <span>비밀번호 확인</span>
                <input
                  type="password"
                  className="input"
                  placeholder="다시 한 번"
                  value={form.pw2}
                  onChange={setF('pw2')}
                />
              </label>
            </div>

            <div className="auth-agree">
              <label className="opt">
                <input type="checkbox" className="cbx" checked={agree.tos} onChange={setA('tos')} />
                <span>
                  <b>(필수)</b> 이용 약관에 동의합니다 <a href="#">보기</a>
                </span>
              </label>
              <label className="opt">
                <input
                  type="checkbox"
                  className="cbx"
                  checked={agree.privacy}
                  onChange={setA('privacy')}
                />
                <span>
                  <b>(필수)</b> 개인정보 처리 방침에 동의합니다 <a href="#">보기</a>
                </span>
              </label>
              <label className="opt">
                <input
                  type="checkbox"
                  className="cbx"
                  checked={agree.marketing}
                  onChange={setA('marketing')}
                />
                <span>(선택) 책담의 새 소식과 추천을 이메일로 받아볼게요</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-cta"
              disabled={!allRequired}
              style={!allRequired ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              계정 만들기
            </button>
          </form>

          <div className="auth-switch">
            이미 계정이 있으세요?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitch && onSwitch();
              }}
            >
              {' '}
              로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageLogin, PageSignup });

// ─────────────────────────────────────────────
//  PageQuoteShare — what someone sees when they open a quote share link
//  Public, read-only. No interactivity (no hearts, no reshare) because
//  the app itself is a personal-recording surface, not a community.
//  The page exists only to display the quote elegantly and invite the
//  reader to start their own 책담.
// ─────────────────────────────────────────────
function PageQuoteShare({ quote, onSignUp, onSignIn }) {
  // Default content lets the artboard render without props in the canvas.
  const q = quote || {
    body: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다. 읽는 동안에는 너무 가벼웠다.',
    highlight: '읽는 동안에는 너무 가벼웠다.',
    author: '김애란',
    book: '바깥은 여름',
    page: 94,
    bookCover: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
    sharedBy: '홍길동',
    sharedAt: '5월 11일',
  };

  // Render the quote body with an optional highlighted phrase using the
  // <mark> design-system style. Falls back to plain text if no highlight.
  const renderBody = () => {
    if (!q.highlight || !q.body.includes(q.highlight)) {
      return <>{q.body}</>;
    }
    const [before, after] = q.body.split(q.highlight);
    return (
      <>
        {before}
        <mark className="qshare-mark">{q.highlight}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="qshare-page" data-screen-label="public · quote share">
      <header className="qshare-top">
        <a className="qshare-brand" href="#">
          <span className="qshare-brand-mark">책담</span>
          <span className="qshare-brand-tag">한 줄을 담아두는 곳</span>
        </a>
        <button className="btn btn-ghost qshare-signin" onClick={onSignIn}>
          로그인
        </button>
      </header>

      <main className="qshare-main">
        <figure className="qshare-card">
          <div className="qshare-quotemark" aria-hidden="true">
            “
          </div>
          <blockquote className="qshare-body">{renderBody()}</blockquote>
          <figcaption className="qshare-cite">
            <div className="qshare-book">
              <div className="qshare-book-cover" style={{ background: q.bookCover }} />
              <div className="qshare-book-meta">
                <div className="qshare-book-title">{q.book}</div>
                <div className="qshare-book-author">
                  {q.author} · p.{q.page}
                </div>
              </div>
            </div>
          </figcaption>
          <div className="qshare-attribution">
            <span className="qshare-attr-avatar">{q.sharedBy.slice(0, 1)}</span>
            <span>
              <b>{q.sharedBy}</b>님이 담은 한 줄 · {q.sharedAt}
            </span>
          </div>
        </figure>

        <section className="qshare-cta">
          <div className="qshare-cta-eyebrow">책담은</div>
          <h2 className="qshare-cta-title">
            마음에 닿은 문장을
            <br />
            천천히 모아두는 개인 독서 기록 앱이에요.
          </h2>
          <p className="qshare-cta-sub">
            누구에게 보여주기 위한 곳이 아닌, 본인의 노트로 시작해 보세요.
          </p>
          <button className="btn btn-primary qshare-cta-btn" onClick={onSignUp}>
            책담 시작하기
          </button>
        </section>
      </main>

      <footer className="qshare-foot">
        <span>책담 · 한 줄을 담아두는 곳</span>
        <span className="qshare-foot-dot">·</span>
        <a href="#">소개</a>
        <a href="#">개인정보 처리방침</a>
      </footer>
    </div>
  );
}

Object.assign(window, { PageQuoteShare });
