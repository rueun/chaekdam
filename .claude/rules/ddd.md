# Rule: Domain-Driven Design

근거: `docs/ADR.md` ADR-004·008·009·010·012 / `docs/ARCHITECTURE.md` §5.

## 빌딩 블록

- **Entity**: 식별자(ID)로 동일성 판단. 가변 상태 + 불변식(invariant)을 메서드로 보호.
- **Value Object(VO)**: 값으로 동일성 판단. 불변. 생성 시 유효성 검증. (예: `NoteSource`, `BookStatus`, `Role`)
- **Aggregate Root**: 트랜잭션·일관성 경계. 외부에서는 루트를 통해서만 내부에 접근. 다른 Aggregate는 **ID로만 참조**.
- **Specification**: 도메인 규칙/권한을 객체로 표현 (`**/specs/`). RLS와 이중 방어(ADR-004).
- **Domain Event**: 부수효과 트리거 (예: `HighlightCaptured`, `ReadingSessionLogged`).

## 핵심 엔티티 (확정)

| 이름             | 종류           | 메모                                                                        |
| ---------------- | -------------- | --------------------------------------------------------------------------- |
| `User`           | Entity         | 사용자                                                                      |
| `Participant`    | Entity         | 토론 참가자(User/AI 참조). **다중 사용자 확장 대비**(ADR-008) — MVP는 1명뿐 |
| `Book`           | Entity         | 책 메타(제목·저자·장르·요약·저자 스타일)                                    |
| `BookStatus`     | VO             | `READING` / `DONE` / `WISH` / `PAUSED` (책장). 위시리스트 = `WISH`          |
| `Author`         | Entity         | 이름·생몰년·저작권 만료 여부 — **작가 페르소나 활성 판정에 사용**           |
| `Persona`        | Entity         | 4 아키타입. `author`는 **사망 작가만** 활성                                 |
| `Highlight`      | Entity         | "한 줄" — 캡처한 구절. 저널링 핵심 단위                                     |
| `NoteSource`     | VO             | `PHOTO` / `TEXT`                                                            |
| `ReadingSession` | Entity         | '분'(리더 체류) + 페이지 범위                                               |
| `ReadingLog`     | Entity         | 일자별 읽음·연속일·통계 집계                                                |
| `Discussion`     | Aggregate Root | 책+한 줄+페르소나+참가자. **책당 다중 방, 생성 시 페르소나 고정**           |
| `Message`        | Entity         | 토론 발화                                                                   |
| `Role`           | VO             | `USER` / `AI`                                                               |

> `Reflection`(자유 회고 노트) 엔티티는 두지 않는다. 저널링은 `Highlight` + `ReadingLog`로 실현(ADR-010).

## Aggregate 경계

- `Discussion`: 메시지/참가자 추가가 한 트랜잭션. Persona·Book·Highlight는 **ID 참조**. 페르소나는 생성 후 **불변**.
- `Highlight` / `ReadingLog` / `ReadingSession`: 각각 독립 Aggregate.
- `Book`: 외부 캐시 + `BookStatus`. 단순.
- `Persona`: 시스템 큐레이션. 사용자가 만들지 않음.

## 규칙

- 불변식은 엔티티 **메서드 안에서** 강제한다 (setter 남용 금지). 잘못된 상태 전이는 도메인 예외(`lib/domain/shared/errors.ts`).
- `author` 페르소나로 토론 생성 시 `Author.저작권만료/사망` 여부를 **도메인에서 검증**한다. 생존 작가면 거부.
- ID 외 다른 Aggregate의 내부 엔티티를 직접 들고 다니지 않는다.
