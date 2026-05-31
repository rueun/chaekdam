# 책담 (chaekdam) — 프로젝트 설정

AI 독서 토론 웹 / 앱. **글로벌 규칙(`~/.claude/rules/`)에 더해** 아래 프로젝트 규칙이 적용됩니다.

## 기술 스택

- 프레임워크: **Next.js 15+ (App Router)**
- 언어: **TypeScript (strict mode)**
- 스타일링: **Tailwind CSS**
- BaaS: **Supabase** (Auth + Postgres + Storage)
- AI: **Claude API** (Anthropic SDK, multimodal vision)
- 배포: **Vercel**
- 테스트: **Vitest** (단위) + **Playwright** (E2E)

## 빌드 / 실행 명령어

- 개발: `pnpm dev`
- 빌드: `pnpm build`
- 테스트: `pnpm test`
- E2E: `pnpm test:e2e`
- 타입 체크: `pnpm typecheck`
- Supabase 로컬: `supabase start`
- Supabase 타입 생성: `pnpm supabase:types`

## 핵심 아키텍처 원칙

1. **Clean Architecture + Domain First** — 도메인부터 설계 후 인프라 결정
2. **`lib/domain/`은 외부 의존 0** — Next.js, Supabase, Claude SDK, React 모두 import 금지
3. **언제든 별도 백엔드(Nest)로 이전 가능한 구조** — 도메인 / 유스케이스 그대로 이식

위반 검사: `/arch-check`, `/domain-check`, `/arch-review` 슬래시 명령어

## 도메인 작업 시 자동 적용 (글로벌 import)

`~/.claude/rules/architecture.md`, `ddd.md`, `design-patterns.md` 가 글로벌에서 자동 로드됩니다.

## 핵심 라이브러리

- **TanStack Query** — 서버 상태·캐싱·invalidation
- **react-hook-form + zod + @hookform/resolvers** — 폼·검증 통합
- **react-error-boundary** — 컴포넌트 에러 경계
- **nuqs** — URL 쿼리 상태 (책 검색·필터)
- **overlay-kit** — 모달·다이얼로그 함수형 호출
- **es-toolkit** — 가벼운 유틸 (lodash 대체)

## 도구 자동화

- **Lefthook** + **oxlint** + **ESLint** + **oxfmt** — pre-commit 자동 검사·수정
- 자세한 표준: `~/.claude/rules/tooling.md` (글로벌 자동 로드)

## 프론트엔드 패턴 import

@~/.claude/rules/frontend.md

## 프로젝트 한정 규칙

@.claude/rules/stack.md
@.claude/rules/testing.md

## 꼭 먼저 읽을 문서

1. `docs/PRD.md` — 제품·기능·범위
2. `docs/ARCHITECTURE.md` — 디렉토리·도메인 모델·의존성·빌드 순서
3. `docs/ADR.md` — 결정 013개와 근거
4. `docs/naver-book-search-api.md` — 도서 검색 API

## 작업 규칙 (반드시 준수)

- `.claude/rules/architecture.md` — 계층·의존성 방향, `lib/domain/` 외부 의존 0
- `.claude/rules/ddd.md` — 엔티티·VO·Aggregate·Specification
- `.claude/rules/design-patterns.md` — Ports & Adapters·Repository·UseCase
- `.claude/rules/design-system.md` — 토큰·테마·UI 충실도
- `.claude/rules/testing.md` — 테스트 전략

## 작업 방식

- **한 번에 전체 금지.** `docs/ARCHITECTURE.md`의 빌드 순서대로 **수직 슬라이스 하나씩**
  (도메인 → Port → 유스케이스 → Infra → UI) 끝까지 구현하고 멈춰서 확인을 받는다.
- UI는 `design/handoff/ui_kits/`(또는 핸드오프 위치)의 HTML 목업을 **레퍼런스**로 삼아
  레포 컴포넌트 시스템으로 **재현**한다. HTML을 그대로 복붙하지 않는다.
- 새 결정을 내리면 `docs/ADR.md`에 ADR 항목을 추가한다.

→ 결정 시 `docs/ARCHITECTURE.md` 의 도메인 모델 섹션을 갱신.
