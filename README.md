# 책담 (chaekdam)

> 📚 인상 깊은 구절을 사진 한 장으로 — AI와 시작하는 독서 토론

## 무엇인가요

책을 읽다가 마음에 든 구절이나 페이지를 사진으로 찍거나 텍스트로 입력하면, AI가 그 내용을 바탕으로 **1:1 깊이 있는 토론**을 시작합니다. 혼자 책을 읽고 끝내기엔 아쉬운, 그 한 페이지에 담긴 생각을 함께 나누고 정리하는 도구입니다.

## 핵심 기능

- 📖 **책 / 작가 검색**: 외부 도서 API 기반 검색·선택
- 📸 **인상 깊은 구절 캡처**: 사진 업로드 또는 직접 텍스트 입력
- 💬 **AI 독서 토론**: Claude API 기반 1:1 깊이 대화
- 📝 **토론 기록 저장**: 본인의 독서 노트로 누적

## 기술 스택

| 영역             | 기술                                          |
| ---------------- | --------------------------------------------- |
| 프레임워크       | Next.js 15+ (App Router)                      |
| 언어             | TypeScript (strict mode)                      |
| 스타일링         | Tailwind CSS                                  |
| 인증·DB·스토리지 | Supabase (Auth + Postgres + Storage)          |
| AI               | Claude API (Anthropic SDK, multimodal vision) |
| 배포             | Vercel                                        |
| 테스트           | Vitest + Playwright                           |

## 아키텍처

**Clean Architecture + Domain First** 원칙으로 설계되어, 비즈니스 로직이 프레임워크·BaaS에 의존하지 않습니다. 도메인 코드는 `lib/domain/`에 격리되어 있어, 추후 별도 백엔드(Nest 등)로 분리하더라도 그대로 이식 가능합니다.

자세한 아키텍처 결정·디렉토리 구조·전환 매트릭스는 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)를 참조하세요.

## 시작하기

> 🚧 초기 설정 중. 아래 명령어는 프로젝트 부트스트랩 후 활성화됩니다.

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY 등 입력

# Supabase 로컬 실행
supabase start

# 개발 서버
pnpm dev
```

## 디렉토리 구조 (계획)

```
chaekdam/
├── app/                      # Next.js App Router (Presentation)
├── lib/
│   ├── domain/               # 순수 도메인 로직 (외부 의존 0)
│   ├── application/          # 유스케이스
│   └── infrastructure/       # Supabase / Claude 어댑터
├── components/               # 재사용 UI 컴포넌트
├── supabase/                 # 마이그레이션·RLS 정책
├── docs/                     # 아키텍처·결정 기록
└── .claude/                  # Claude Code 프로젝트 규칙
```

## 라이선스

미정 (개인 프로젝트)
