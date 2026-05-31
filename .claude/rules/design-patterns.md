# Rule: Design Patterns

근거: `docs/ADR.md` ADR-005·006 / `docs/ARCHITECTURE.md` §4~5.

## Ports & Adapters

- 도메인이 **Port(인터페이스)**를 정의(`lib/domain/ports/`), Infrastructure가 **Adapter**로 구현.
- 도메인·유스케이스는 Adapter 구현체를 import하지 않는다 — Port 타입에만 의존.

| Port                     | Adapter                        |
| ------------------------ | ------------------------------ |
| `BookSearcher`           | `NaverBookSearcher`            |
| `BookRepository`         | `SupabaseBookRepository`       |
| `HighlightRepository`    | `SupabaseHighlightRepository`  |
| `ReadingLogRepository`   | `SupabaseReadingLogRepository` |
| `DiscussionRepository`   | `SupabaseDiscussionRepository` |
| `PersonaRepository`      | `SupabasePersonaRepository`    |
| `AiDiscussionPartner`    | `ClaudeAiDiscussionPartner`    |
| `HighlightImageRenderer` | `CanvasHighlightImageRenderer` |
| `PhotoStorage`           | `SupabasePhotoStorage`         |
| `AuthSession`            | `SupabaseAuthSession`          |

## UseCase

- 한 파일 = 한 유스케이스 (`lib/application/<verb-noun>.use-case.ts`).
- 생성자(또는 팩토리)로 Port를 **주입**받는다. 내부에서 구현체를 생성하지 않는다.
- 입력 DTO → 도메인 호출 → 결과 DTO. 트랜잭션 경계 = Aggregate 1개 원칙.

## Repository

- 도메인 Aggregate 단위로 저장/조회. 도메인 ↔ persistence 매핑은 Adapter 책임.
- 쿼리 결과(Supabase row)를 그대로 상위로 올리지 않고 **도메인 엔티티로 변환**해 반환.

## AI 어댑터 (ADR-005·007)

- `AiDiscussionPartner`는 페르소나 톤(시스템 프롬프트) + 책 메타 + 한 줄을 받아 응답 생성.
- 책 메타데이터는 **시스템 프롬프트에 1회 주입 + 프롬프트 캐싱**. 한 줄/사진은 매 턴 컨텍스트.
- 스트리밍 응답 지원. LLM 교체 가능성을 위해 Anthropic SDK는 이 Adapter 안에만.

## 컴포넌트 슬라이싱 (ADR-006)

- 도메인/유스케이스/인프라 = Clean Arch **수평 분리** 유지.
- **UI 컴포넌트만 기능별 수직 응집**:
  - `components/ui/` — 재사용 primitives (디자인 시스템)
  - `components/feature/` — `book-search/`, `highlight-capture/`, `discussion-chat/`, `reading-log/`, `library/`, `share/`
- 한 화면이 여러 도메인을 조합하면 feature 슬라이스에서 유스케이스들을 호출해 합친다.
