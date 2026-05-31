# Rule: Architecture (Clean Architecture)

근거: `docs/ADR.md` ADR-002 · ADR-003 · ADR-005 / `docs/ARCHITECTURE.md` §2~3.

## 4계층과 의존성 방향

```
Presentation (app/, components/)
      │
      ▼
Application (lib/application/)
      │
      ▼
Domain (lib/domain/)  ◄────── Infrastructure (lib/infrastructure/)
      ▲                                │
      └────── Port (interface) ────────┘
```

- **내부 계층은 외부 계층을 모른다.** Domain → Application → Presentation 방향으로만 의존.
- **DIP**: Infrastructure가 Domain이 정의한 **Port(인터페이스)**를 구현한다. 도메인은 구현체를 모른다.
- 의존성 조립은 `lib/infrastructure/di-container.ts` 한 곳에서만.

## `lib/domain/` 절대 규칙 (ADR-003) — 위반 시 작업 중단

`lib/domain/` 안에서 다음 import **금지**:

- `next/*`, `next/server`
- `@supabase/*`
- `@anthropic-ai/sdk`
- `react`, `react-dom`
- ORM 클라이언트 (`prisma`, `typeorm`, `drizzle` 등)

도메인은 **표준 라이브러리 + 자체 타입만** 사용한다. Supabase 자동생성 타입을 도메인에서 직접 쓰지 말고,
Infrastructure에서 도메인 엔티티로 **매핑**한다.

> 이유: 백엔드를 별도 서버(NestJS 등)로 옮길 때 `lib/domain/`·`lib/application/`을 **그대로 복사**할 수 있어야 한다.

## 진입점은 얇게

- Server Action / Route Handler / Controller는 **얇은 어댑터**다 — 입력 파싱 → 유스케이스 호출 → 응답 매핑만.
- 비즈니스 로직을 Server Action에 직접 쓰지 않는다 (ADR-001의 한계를 ADR-002로 보완).

## 권한은 이중 방어 (ADR-004)

- 1차: Supabase RLS 정책(SQL).
- 2차: 도메인 `Specification` 객체 (`lib/domain/**/specs/`)로 같은 규칙을 표현.
- 백엔드 분리 시 RLS만 제거하고 Spec은 유지한다.

## 자가 점검

도메인/유스케이스 작성 후, 위 import 금지 목록을 스스로 grep해 위반이 없는지 확인하고 보고한다.
