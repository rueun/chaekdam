# Google 로그인(OAuth) 설정

Supabase Auth 의 Google 프로바이더로 구현. 코드는 연동돼 있고, **Google Cloud 자격(Client ID/Secret)만 넣으면** 동작한다.

흐름: 버튼 → `signInWithGoogle`(서버 액션) → Supabase OAuth URL → Google 로그인 →
Supabase `/auth/v1/callback` → 앱 `/auth/callback`(코드→세션 교환) → `/home`.

## 1. Google Cloud 자격 발급

1. https://console.cloud.google.com → 프로젝트 생성/선택.
2. **APIs & Services → OAuth consent screen**: External, 앱 이름·이메일 입력(테스트 단계면 테스트 사용자에 본인 계정 추가).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
4. **승인된 리디렉션 URI(Authorized redirect URIs)** 에 Supabase 콜백을 등록:
   - 로컬: `http://127.0.0.1:54321/auth/v1/callback`
   - 운영: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
   - (앱 자신의 `/auth/callback` 이 아니라 **Supabase** 콜백을 넣는다.)
5. 생성된 **Client ID** 와 **Client secret** 복사.

## 2. 자격 입력 위치 ⭐

### 로컬(`supabase start`)

`.env.local` 에 채운다 — `supabase/config.toml` 의 `env()` 가 이 값을 읽는다:

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<Client ID>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<Client secret>
```

그리고 **supabase CLI 가 이 값을 보도록** 환경에 로드한 뒤 재시작한다(.env.local 은 CLI 가 자동으로 읽지 않음):

```
set -a; source .env.local; set +a
supabase stop && supabase start
```

(또는 두 변수를 직접 `export` 후 `supabase start`.) Next 앱은 이 값이 필요 없다 — 로컬 Supabase 인증 서버만 사용한다.

### 운영(Supabase 호스팅)

config.toml 이 아니라 **대시보드**에서 설정: Authentication → Providers → Google → Enable + Client ID/Secret 입력. 운영 앱의 `additional redirect URLs` 에 배포 도메인의 `/auth/callback` 을 추가.

## 3. 확인

`supabase start` 후 `/login` 의 "Google로 로그인" 클릭 → **팝업 창**에서 Google 동의 →
팝업이 닫히며 원래 화면이 `/home` 으로 전환된다(팝업 차단 시 현재 탭에서 진행).
실패 시 `/login?error=oauth` 로 돌아온다(서버 로그에 원인 출력).

흐름: 버튼 → 팝업 open → `signInWithGoogle`(URL 반환) → 팝업이 Google → Supabase →
`/auth/callback`(code→세션) → `/auth/popup-complete`(부모에 알림 후 닫기) → 부모가 `/home`.

## 참고

- 카카오/네이버 버튼은 아직 스텁(토스트) — 같은 패턴으로 추후 추가.
- 시크릿은 절대 git 에 커밋하지 않는다(`.env.local` gitignore, config.toml 은 `env()` 치환만).
