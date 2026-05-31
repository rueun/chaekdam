# Handoff: 책담 (Chaekdam) — AI 독서 토론 · 독서 기록 앱

> 이 번들은 **클로드 코드(Claude Code)로 책담을 구현**하기 위한 핸드오프 패키지입니다.
> 이미 존재하는 레포에 이 폴더를 통째로 넣고(예: `design/` 또는 `docs/handoff/`),
> 클로드 코드에게 읽히면서 작업을 지시하세요.

---

## 0. 가장 먼저 읽을 것 (클로드 코드 onboarding 순서)

1. `docs/PRD.md` — 제품이 무엇이고 왜 만드는가 (가치·기능·범위)
2. `docs/ARCHITECTURE.md` — 디렉토리·도메인 모델·의존성 규칙·빌드 순서
3. `docs/ADR.md` — 각 결정의 근거·트레이드오프 (013개 결정)
4. `docs/naver-book-search-api.md` — 외부 도서 검색 API 연동 규격
5. `design-system/DESIGN-SYSTEM.md` + `colors_and_type.css` — 디자인 토큰 원본
6. `ui_kits/` — 화면별 시각·동작 레퍼런스 (아래 §4)

---

## 1. 개요

**책담**은 종이책 독자가 인상 깊은 구절을 **"한 줄"로 캡처** → 선택한 **AI 페르소나와 1:1 토론** →
담은 한 줄과 **독서 기록(캘린더·연속일·통계)**이 본인 독서 자산으로 누적되는 서비스입니다.

- 메인 가치: **정서·자기 표현** (혼자 읽기 외로움 → 함께 이야기)
- 보조 가치: **저널링** — 별도 회고 노트가 아니라 *한 줄 + 독서 기록*으로 실현
- 멀티 디바이스: **모바일(iOS)** + **데스크탑 웹**, 동일 IA

---

## 2. 이 디자인 파일에 대하여 (중요)

`ui_kits/` 안의 파일들은 **HTML/React(Babel in-browser)로 만든 디자인 레퍼런스**입니다 —
**그대로 프로덕션에 복붙하는 코드가 아니라**, "이렇게 보이고 이렇게 동작한다"를 보여주는 프로토타입입니다.

작업의 본질은 **이 디자인을 기존 레포의 환경(프레임워크·디자인 시스템·라이브러리)으로 재현**하는 것입니다.
`ARCHITECTURE.md`가 정의한 Clean Architecture(Next.js + Supabase + Claude API) 구조를 따르세요.
HTML 프로토타입은 **레이아웃·색·타이포·카피·인터랙션의 정답지**로만 쓰고,
실제 구현은 레포의 컴포넌트 시스템으로 다시 작성합니다.

> 디자인 토큰의 single source of truth는 `colors_and_type.css`입니다.
> 레포에 이미 토큰 시스템(Tailwind config / CSS 변수)이 있으면 이 값들을 거기에 매핑하세요.

---

## 3. 충실도(Fidelity): **하이파이 (Hi-fi)**

색·타이포·여백·인터랙션이 모두 확정된 픽셀 단위 목업입니다.
UI는 **픽셀에 가깝게 재현**하되, 스타일링은 레포의 기존 컴포넌트/디자인 시스템으로 구현하세요.
정확한 수치는 (a) 아래 토큰 표, (b) `colors_and_type.css`, (c) 해당 화면의 HTML/CSS를 직접 참조.

---

## 4. UI 키트 — 화면별 레퍼런스

키트는 클릭-스루 프로토타입입니다. 로컬에서 열어 확인하세요:

```
# 정적 서버로 열기 (CDN 스크립트·상대경로 때문에 file:// 보다 권장)
npx serve design_handoff_chaekdam
# 그 다음 브라우저에서:
#   /ui_kits/web/index.html?screen=home
#   /ui_kits/mobile/index.html?screen=home
#   /screens-canvas.html         ← 모든 화면을 한 캔버스에서 비교
```

화면은 URL 쿼리 `?screen=<id>` 로 전환합니다.

### 4-1. 웹 (데스크탑 · 1440×900 · 사이드바 + 메인)

`ui_kits/web/index.html?screen=<id>`

| id                        | 화면         | 설명                                                             | 스크린샷                           |
| ------------------------- | ------------ | ---------------------------------------------------------------- | ---------------------------------- |
| `home`                    | 홈           | 인사 + 이어 읽기 Hero + 독서 로그 + 읽는 중/최근 밑줄/위시리스트 | `screenshots/web-01-home.png`      |
| `library`                 | 내 서재      | 책장 필터(전체/읽는 중/완독/읽고 싶은/밑줄만) + 책 그리드        | —                                  |
| `wish`                    | 읽고 싶은    | 위시리스트 (정렬·지금부터 읽기·빼기). `&empty=1` 빈 상태         | —                                  |
| `book`                    | 책 상세      | 표지·상태·통계·소개·담은 한 줄·AI 토론방 목록·세션               | `screenshots/web-03-book.png`      |
| `reader`                  | 읽는 중 + AI | 리더 페인 + AI 토론 패널 + 세션 타이머. `&empty=1` 빈 상태       | `screenshots/web-02-reader-ai.png` |
| `quotes`                  | 밑줄 모음    | 담은 한 줄 피드                                                  | —                                  |
| `talk`                    | AI 독서토론  | 책별 다중 대화방, 방마다 페르소나 고정                           | `screenshots/web-05-talk.png`      |
| `stats`                   | 독서 기록    | 연간 컨트리뷰션 그리드·연속일·장르/작가 통계                     | `screenshots/web-04-stats.png`     |
| `settings`                | 설정         | 계정·AI 페르소나 선택·데이터                                     | —                                  |
| `login`/`signup`/`forgot` | 인증         | 풀블리드 인증 화면                                               | —                                  |

모달(쿼리로 진입): `&capture=1`(한 줄 담기) · `&addbook=1`(책 추가) · `&search=1`(전체 검색) ·
`&qmenu=1`(한 줄 메뉴) · `&newchat=1`(새 대화) · `&profile=1`(프로필 수정) · `&confirm=1`(삭제 확인).

### 4-2. 모바일 (iOS · 402×874 · 탭바 + FAB)

`ui_kits/mobile/index.html?screen=<id>`

| id                           | 화면        | 설명                                           | 스크린샷                             |
| ---------------------------- | ----------- | ---------------------------------------------- | ------------------------------------ |
| `home`                       | 홈          | 인사·이어 읽기·빠른 액션·독서 로그·최근 밑줄   | `screenshots/mobile-01-home.png`     |
| `library`                    | 내 서재     | 책장 칩 + 그리드 (`읽고 싶은` 칩 → 위시리스트) | —                                    |
| `book`                       | 책 상세     | 표지·상태·통계·담은 한 줄·세션·공유            | —                                    |
| `reader`                     | 읽는 중     | 리더 + 세션 타이머 + 툴바                      | `screenshots/mobile-02-reader.png`   |
| `chat`                       | AI 토론     | 페르소나 고정 1:1 채팅                         | `screenshots/mobile-03-chat.png`     |
| `capture`                    | 한 줄 담기  | 카메라/OCR → 인식된 문장 확인 → 저장           | `screenshots/mobile-04-capture.png`  |
| `search`                     | 검색        | 책·작가·한 줄 검색                             | —                                    |
| `addbook`                    | 책 추가     | 네이버 책 검색 → 책장 선택 시트                | —                                    |
| `quotes`                     | 밑줄 모음   | 한 줄 피드 + 정렬                              | —                                    |
| `wishlist`                   | 읽고 싶은   | 위시리스트 행 (지금부터 읽기·빼기)             | `screenshots/mobile-05-wishlist.png` |
| `stats`                      | 독서 기록   | 연간 그리드·통계                               | —                                    |
| `profile`/`settings`/`pedit` | 프로필·설정 | 계정·페르소나·데이터                           | —                                    |
| `qdetail`                    | 한 줄 상세  | 한 줄·태그·메타·공유                           | —                                    |
| `login`/`signup`/`forgot`    | 인증        | 풀블리드 인증                                  | —                                    |

탭바: 홈 · 서재 · AI · 캡처 · 나. FAB = 한 줄 담기.

---

## 5. 디자인 토큰 (원본: `colors_and_type.css`)

### 색 — 단일 라이트(페이퍼) 테마, **다크 모드 없음**

| 토큰                              | 값                                         | 용도                                                       |
| --------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `--paper-50`                      | `#FAF8F2`                                  | 페이지 배경 (웜 크림)                                      |
| `--paper-100`                     | `#F2EFE6`                                  | 카드·표면                                                  |
| `--paper-200 / 300`               | `#E6E1D2` / `#CBC4AE`                      | 디바이더                                                   |
| `--ink-900`                       | `#1A1A18`                                  | 본문 텍스트 (웜 니어블랙, **순검정 아님**)                 |
| `--ink-600 / 500`                 | `#5E5C53` / `#82807A`                      | 보조·3차 텍스트                                            |
| `--terra-500` (**브랜드/accent**) | `#3F6750`                                  | 딥 포레스트 그린 — CTA·브랜드·포커스 (**유일한 포인트색**) |
| `--terra-600 / 700`               | `#2D5240` / `#1F4030`                      | accent hover/press                                         |
| `--sage-500`                      | `#6E8B5E`                                  | 보조 — 완독/성공                                           |
| `--clay-500`                      | `#A85F37`                                  | 완독·오늘 마커 (테라코타)                                  |
| `--talk-500`                      | `#6B7E89`                                  | AI 귀속 표면 (쿨 그레이블루)                               |
| `--mark-100`                      | `#E8DC7F`                                  | 하이라이트(밑줄) — **사용자 강조 전용**                    |
| 의미 토큰                         | `--bg --surface --fg --accent --divider …` | 앱 코드에서 raw 팔레트 대신 이걸 사용                      |

> 색 이름 주의: `--terra-*`는 **back-compat 별칭**이며 값은 _포레스트 그린_ 패밀리입니다. 신규 코드는 `--leaf-*` 별칭 권장.

### 타이포 — Pretendard 전용

- 폰트: `--font-sans` = Pretendard (본문·UI), `--font-serif`도 Pretendard로 별칭(편집체 슬롯)
- 스케일(px): display 56 / h1 40 / h2 30 / h3 22 / h4 18 / body 16 / body-sm 14 / caption 13 / micro 11
- 줄높이: tight 1.2 / snug 1.35 / normal 1.55 / loose 1.75 · 자간: 한글은 약간 타이트(-0.01~-0.02em)

### 형태·그림자·여백·모션

- radius: xs 4 / sm 8 / md 12 / lg 16 / xl 24 / pill 999
- shadow: `--shadow-1`~`-4` (웜 올리브 틴트 — 차가운 유리 아닌 종이 위 잉크 느낌)
- spacing: 4px 베이스 (`--sp-1`=4 … `--sp-24`=96)
- motion: `--ease-out` cubic-bezier(.22,.61,.36,1), `--dur-1~4` 120/200/320/480ms, 바운스 없음

---

## 6. 인터랙션 · 동작 핵심

- **세션 타이머**: '분' = 리더 화면 체류 시간. 명시적 시작/일시정지/종료(웹), 탭 백그라운드 시 일시정지. 종이책을 자동 계측할 수 없어 화면 체류로 근사.
- **AI 토론방**: 한 책에 여러 방. **방 생성 시 페르소나(토론자)가 고정**되어 이후 변경 불가. 완독 시 토론자가 먼저 질문하는 "자동 토론 시작"(옵션).
- **한 줄 담기**: 사진 촬영/업로드 → OCR(`인식된 문장`) → 확인 → 저장. 핵심 단위 = "한 줄".
- **책장 상태**: 읽는 중 / 완독 / 읽고 싶은 / 쉬는 중. 위시리스트 = `BookStatus = wish`.
- **공유**: 한 줄/책을 링크·한 장 이미지·SNS(카카오/X/스레드/메일)로 **내보내기만**. 인앱 피드·좋아요·팔로우는 없음.
- **하이라이트 옐로(`--mark-100`)**: 사용자 강조 텍스트에만. 장식으로 쓰지 말 것.

상태(빈/로딩/에러) 예시는 `?...&empty=1`, 책 추가 화면의 idle/loading/empty/done 상태(`book-search-screen.jsx`) 참조.

---

## 7. 페르소나 (4종 · `settings` 화면 + 채팅 헤더에서 확인)

| id         | 이름 · 역할                       | 톤                       | 비고                                    |
| ---------- | --------------------------------- | ------------------------ | --------------------------------------- |
| `socrates` | 소크라테스 · 질문하는 사람 (기본) | 답을 주지 않고 묻기만 함 |                                         |
| `critic`   | 비평가 · 분석하는 사람            | 구조·문체·맥락 분석      |                                         |
| `author`   | 작가 본인 · 쓴 사람의 목소리      | 인터뷰·서신 톤           | **사망 작가에 한해 활성** (책마다 다름) |
| `friend`   | 책 동무 · 같이 읽는 친구          | 분석 없이 같이 반응      |                                         |

> 페르소나는 **톤만** 시스템 프롬프트로 지정 — 작가별 큐레이션 파일 없음(Claude가 책·작가 컨텍스트로 톤 생성). 근거: `ADR.md` ADR-009.

---

## 8. 권장 빌드 순서 (ARCHITECTURE 기반, 슬라이스 단위)

> 한 번에 전부보다, **수직 슬라이스 하나씩** 끝까지(도메인→Port→유스케이스→Infra→UI) 가는 게 품질이 좋습니다.

1. **기반**: 디자인 토큰을 레포 시스템에 매핑, `lib/domain/` 골격 + 의존성 가드(ADR-003) 세팅
2. **인증 + 책 검색**: 네이버 책 검색(`BookSearcher`/`NaverBookSearcher`) → 책장에 담기(`BookStatus`)
3. **한 줄 담기**: `Highlight` 도메인 + OCR(Claude vision) + `PhotoStorage`
4. **AI 토론**: `Discussion` Aggregate(페르소나 고정) + `AiDiscussionPartner`/Claude(스트리밍·프롬프트 캐싱)
5. **독서 기록**: `ReadingSession`(분 계측) + `ReadingLog`(연속일·통계)
6. **밑줄 모음 / 위시리스트 / 공유**: 컬렉션 화면 + `HighlightImageRenderer`

각 단계마다 ADR의 의존성 규칙(`lib/domain/` 외부 의존 0)과 권한 이중 방어(RLS + Spec, ADR-004) 준수.

---

## 9. 파일 목록 (이 번들)

```
design_handoff_chaekdam/
├── README.md                      ← (이 파일)
├── .claude/                        ← 클로드 코드 가드레일 (레포 루트로 이동해 사용)
│   ├── CLAUDE.md                   ← 프로젝트 메모리 (문서·규칙·빌드 순서 지시)
│   └── rules/
│       ├── architecture.md  ddd.md  design-patterns.md
│       ├── stack.md  design-system.md  testing.md
├── colors_and_type.css            ← 디자인 토큰 원본 (single source of truth)
├── design-canvas.jsx              ← screens-canvas 의존 컴포넌트
├── screens-canvas.html            ← 모든 화면을 한 캔버스에서 비교
├── design-system/
│   └── DESIGN-SYSTEM.md            ← 디자인 시스템 설명(색/타이포/규칙)
├── docs/
│   ├── PRD.md  ADR.md  ARCHITECTURE.md
│   └── naver-book-search-api.md
├── ui_kits/
│   ├── web/    (index.html + components.jsx, pages-extra.jsx, missing.jsx,
│   │            book-search.jsx, auth.jsx, web.css, missing.css …)
│   └── mobile/ (index.html + components.jsx, screens-extra.jsx, list-screens.jsx,
│                missing.jsx, book-search-screen.jsx, auth-screens.jsx,
│                ios-frame.jsx, mobile.css, missing.css)
└── screenshots/  (web-01~05, mobile-01~05)
```

> **`.claude/` 사용법**: 번들의 `.claude/` 폴더(`CLAUDE.md` + `rules/`)를 **레포 루트로 이동**하세요.
> 클로드 코드가 매 작업마다 자동으로 읽어 의존성·도메인·디자인 가드레일을 지킵니다.
> `ARCHITECTURE.md`가 참조하는 `.claude/rules/` 경로와 일치합니다.

---

## 10. 클로드 코드에 붙여넣을 첫 프롬프트 (예시)

```
이 레포에 책담(Chaekdam)을 구현한다. 먼저 design/handoff/ 폴더를 읽어라:
1) docs/PRD.md, docs/ARCHITECTURE.md, docs/ADR.md 를 읽고 제품·구조·결정을 요약해줘.
2) ui_kits/web 과 ui_kits/mobile 의 화면을 디자인 레퍼런스로 삼되,
   ARCHITECTURE.md가 정의한 Clean Architecture(Next.js + Supabase + Claude API)로 재현한다.
3) colors_and_type.css 의 토큰을 이 레포의 (Tailwind/CSS 변수) 시스템에 매핑하는 계획을 먼저 제안해줘.

그 다음, README.md §8 빌드 순서의 1단계(기반 + 디자인 토큰 매핑 + lib/domain 골격 +
의존성 가드)만 먼저 구현하고 멈춰라. 내가 확인 후 다음 슬라이스를 지시하겠다.
ADR-003(도메인 외부 의존 0)·ADR-006(컴포넌트 슬라이싱)을 반드시 지켜라.
```

이후 슬라이스마다 "§8의 N단계를 구현해줘 — `ui_kits/.../<화면>`을 레퍼런스로" 식으로 이어가면 됩니다.
