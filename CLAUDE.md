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

## 참고 문서

- 아키텍처 결정·디렉토리 구조·도메인 모델·전환 매트릭스: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- 프로젝트 소개: [`README.md`](./README.md)

## 미결정 사항 (기획 확정 전)

- 토론 모드 (구절 한정 / 책 전체 맥락 / 하이브리드)
- AI 페르소나 (고정 / 선택형)
- 다중 사용자 여부 (1:1 / 북클럽)
- 핵심 사용자 가치 (정서 / 학습 / 저널링)

→ 결정 시 `docs/ARCHITECTURE.md` 의 도메인 모델 섹션을 갱신.
