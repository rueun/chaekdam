# 기능 03: AI 페르소나 선택

> US-5 — 토론을 진행할 AI 페르소나를 선택한다.

## 입력

- 없음 (조회만) → `personas` 테이블 전체 노출

## 동작 흐름

1. 노트 추가 화면에서 "다음 →" 클릭 시 페르소나 선택 화면 진입
2. Server Component 가 `PersonaRepository.findAll()` 로 페르소나 목록 조회
3. `is_default = true` 인 페르소나 자동 선택
4. 사용자가 다른 페르소나 클릭 시 변경
5. "토론 시작" 버튼 → 다음 단계 (`features/04-discussion-start`)

## API / Server Action

```typescript
// app/(dashboard)/personas/page.tsx (Server Component)
import { listPersonas } from '@/lib/application/list-personas.use-case';

export default async function PersonasPage() {
  const personas = await listPersonas(); // PersonaRepository.findAll()
  return <PersonaSelector personas={personas} />;
}
```

## 도메인 Port

- `PersonaRepository.findAll(): Promise<Persona[]>`
- `PersonaRepository.findById(id): Promise<Persona | null>`
- `PersonaRepository.findDefault(): Promise<Persona>` (기본 페르소나 조회)

## 예외

| 상황                     | 처리                                     |
| ------------------------ | ---------------------------------------- |
| 페르소나 0개 (시드 누락) | 시스템 에러 — 시드 데이터 검증 필요      |
| 기본 페르소나 미설정     | 첫 번째 페르소나 자동 선택 + 시스템 알림 |

## UI 상태

- 페르소나 목록 표시 (3~5개 카드)
- 각 카드에 `displayName`, `description` 노출
- 기본 페르소나는 시각적으로 구분 (`기본` 뱃지)
- 선택 시 라디오 버튼 형태로 표시

## 검증

- **도메인**: `Persona.create` 의 시스템 프롬프트 빈 문자열 검증
- **통합**: 시드 데이터(기본 페르소나 1개 포함)가 정상 INSERT 되는지
- **E2E**: 페르소나 선택 후 다음 화면 정상 진입

## 데이터

페르소나는 시스템 큐레이션 데이터로 [`../data-model.md` §7 시드](../data-model.md) 참조.

V1 페르소나 3개:

- `STUDIOUS` — 학구파 독서 친구 (기본)
- `CASUAL` — 캐주얼한 친구
- `CRITIC` — 비평가

## UX 디테일

- 모바일에서 큰 탭 영역 (한 손 사용 가능)
- 페르소나 설명은 1~2줄 내에 핵심 톤 전달
- 시스템 프롬프트 자체는 사용자에게 노출 X
