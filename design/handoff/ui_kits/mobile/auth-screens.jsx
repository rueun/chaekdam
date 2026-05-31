// Chaekdam · Mobile auth screens (login + signup)

function MNaver() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFFFFF" d="M14.4 12.6L9.3 5H4v14h5.6V11.4L14.7 19H20V5h-5.6v7.6z" />
    </svg>
  );
}
function MGoogle() {
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
function MKakao() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="#000"
        d="M16 6C8.8 6 3 10.5 3 16.1c0 3.5 2.3 6.6 5.8 8.4-.3 1-1 3.7-1.2 4.4-.2.8.3.8.6.6.3-.2 4.2-2.8 5.9-4 .6.1 1.2.1 1.9.1 7.2 0 13-4.5 13-10.1S23.2 6 16 6z"
      />
    </svg>
  );
}

// ─────────── Login ───────────
function LoginScreen({ onSwitch, onForgot }) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  return (
    <div className="m-auth" data-screen-label="12 Login">
      <div className="m-auth-brand">
        <div className="m-brand-mark">
          <span className="wm">책담</span>
          <span className="tag">Chaekdam</span>
        </div>
        <div className="tag">한 줄을 담아두는 곳</div>
      </div>

      <div className="m-auth-quote">
        <p>
          "아주 천천히 책장을 넘기는 사람만이
          <br />
          어떤 문장이 자신의 것인지 알아본다."
        </p>
        <div className="cite">김연수, 일곱 해의 마지막</div>
      </div>

      <div className="m-auth-form">
        <button className="m-auth-btn m-auth-kakao">
          <MKakao />
          카카오로 로그인
        </button>
        <button className="m-auth-btn m-auth-naver">
          <MNaver />
          네이버로 로그인
        </button>
        <button className="m-auth-btn m-auth-google">
          <MGoogle />
          Google로 로그인
        </button>

        <div className="m-auth-divider">
          <span>또는 이메일로</span>
        </div>

        <label className="m-auth-field">
          <span>이메일</span>
          <input
            type="email"
            className="input"
            placeholder="reader@chaekdam.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="m-auth-field">
          <span>비밀번호</span>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>

        <button className="m-auth-cta">로그인</button>

        <div className="m-auth-links">
          <a
            onClick={(e) => {
              e.preventDefault();
              onForgot && onForgot();
            }}
            style={{ cursor: 'pointer' }}
          >
            비밀번호 잊으셨나요?
          </a>
          <span className="dot">·</span>
          <a
            onClick={(e) => {
              e.preventDefault();
              onSwitch && onSwitch();
            }}
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────── Signup ───────────
function SignupScreen({ onSwitch }) {
  const [form, setForm] = React.useState({ name: '', email: '', pw: '' });
  const [agree, setAgree] = React.useState({ tos: false, privacy: false, marketing: false });
  const setF = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const setA = (k) => (e) => setAgree((prev) => ({ ...prev, [k]: e.target.checked }));
  const ok = agree.tos && agree.privacy;

  return (
    <div className="m-auth m-auth-signup" data-screen-label="13 Signup">
      <div className="m-auth-brand">
        <div className="m-brand-mark">
          <span className="wm">책담</span>
          <span className="tag">Chaekdam</span>
        </div>
        <div className="tag">한 줄을 담을 자리를 만들어요</div>
      </div>

      <div className="m-auth-form">
        <button className="m-auth-btn m-auth-kakao">
          <MKakao />
          카카오로 시작
        </button>
        <button className="m-auth-btn m-auth-naver">
          <MNaver />
          네이버로 시작
        </button>
        <button className="m-auth-btn m-auth-google">
          <MGoogle />
          Google로 시작
        </button>

        <div className="m-auth-divider">
          <span>또는 이메일로</span>
        </div>

        <label className="m-auth-field">
          <span>이름</span>
          <input
            className="input"
            placeholder="책담에서 부를 이름"
            value={form.name}
            onChange={setF('name')}
          />
        </label>
        <label className="m-auth-field">
          <span>이메일</span>
          <input
            type="email"
            className="input"
            placeholder="reader@chaekdam.kr"
            value={form.email}
            onChange={setF('email')}
          />
        </label>
        <label className="m-auth-field">
          <span>비밀번호</span>
          <input
            type="password"
            className="input"
            placeholder="8자 이상"
            value={form.pw}
            onChange={setF('pw')}
          />
        </label>

        <div className="m-auth-agree">
          <label className="opt">
            <input type="checkbox" className="cbx" checked={agree.tos} onChange={setA('tos')} />
            <span>
              <b>(필수)</b> 이용 약관 <a>보기</a>
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
              <b>(필수)</b> 개인정보 처리 방침 <a>보기</a>
            </span>
          </label>
          <label className="opt">
            <input
              type="checkbox"
              className="cbx"
              checked={agree.marketing}
              onChange={setA('marketing')}
            />
            <span>(선택) 새 소식과 추천을 받아볼게요</span>
          </label>
        </div>

        <button className="m-auth-cta" disabled={!ok} style={!ok ? { opacity: 0.5 } : {}}>
          계정 만들기
        </button>

        <div className="m-auth-links" style={{ marginTop: 14 }}>
          이미 책담 계정이 있으세요?
          <a
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
  );
}

Object.assign(window, { LoginScreen, SignupScreen });
