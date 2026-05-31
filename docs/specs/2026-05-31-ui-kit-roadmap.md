# UI Kit 로드맵 (디자인시스템 프리미티브)

> 작성일: 2026-05-31 · 상태: 진행 중

## 배경 / 결정

브레인스토밍에서 확정한 방향:

1. **1차 목표** — UI 컴포넌트 우선 (도메인/백엔드는 이후 연결).
2. **방식** — 프리미티브 먼저(bottom-up). `components/ui` 를 토큰 기반으로 완성 후 화면 조립.
3. **체크포인트** — **그룹 단위**로 멈춰 시각 확인 후 다음 그룹.

## 스타일링 컨벤션 (방식 A — 확정)

- 디자인 원본 CSS(`design/handoff/ui_kits/web/*.css`, `colors_and_type.css`)의 컴포넌트 클래스를
  **`app/globals.css` 의 `@layer components` 에 토큰 기반으로 이식**한다.
- `components/ui/*` 는 **타입드 래퍼** — variant/size 를 `cn()` + Record 맵으로 클래스 조합. 신규 의존성(cva 등) 없음.
- 디자인시스템에 없는 프리미티브(예: 제네릭 `Card`)는 `design-system.md` 규칙으로 **합성**하고 주석에 명시.
- 화면(`components/feature/*`)의 bespoke 레이아웃만 Tailwind 유틸 사용. 토큰은 `var(--x)` (raw hex 금지).
- 토큰 원본은 `colors_and_type.css` → `globals.css :root`. 다크 모드 없음(ADR-011).

> 이 컨벤션은 ADR 후보. 확정 시 `docs/ADR.md` 에 항목 추가.

## 확인 수단

- `app/(dev)/ui-kit/page.tsx` (라우트 `/ui-kit`) — 프리미티브를 **누적 전시**하는 쇼케이스.
- 각 그룹 체크포인트마다 `/ui-kit` 에서 hover·focus 까지 직접 확인.

## 그룹 로드맵 (MVP 사용 빈도 순)

| 그룹 | 내용                                                                                          | 상태    |
| ---- | --------------------------------------------------------------------------------------------- | ------- |
| G0   | 토큰 기반 · `StatusBadge` · `BookCard`                                                        | ✅ 완료 |
| G1   | `Button`(primary/secondary/ghost/danger × md/sm × icon) · `Card`(plain/elevated) · `Progress` | ✅ 완료 |
| G2   | `Badge`(new/ai/done) · `Chip`(default/soft/sm/active) · `Tag`                                 | ✅ 완료 |
| G3   | `Input`(+error) · `Search`(+pill/clear) · `Select`                                            | ✅ 완료 |
| G4   | `Checkbox` · `Radio` · `Toggle`(+lg) · `Segmented`                                            | ✅ 완료 |
| G5   | (후순위) `Stepper` · `Slider` · `DatePicker/Calendar` — MVP 미사용 시 보류                    | ⬜      |

> Modal/Dialog 는 overlay-kit 과 묶이는 복합 요소 → 프리미티브가 아니라 화면 조립 단계에서 다룸.

### 아이콘 시스템 (lucide-react) ✅

- `components/ui/icon.tsx` — `<Icon name="..." />`(목업과 동일 API). `currentColor` 상속, 기본 18px.
- 트리셰이킹 위해 **사용하는 아이콘만** `REGISTRY` 에 등록(필요 시 추가). 라벨 없으면 `aria-hidden`.
- `Button` 의 `iconOnly` 는 정사각 SVG 아이콘 전제(`.btn-icon { line-height: 1 }`). 이모지 사용 금지(design-system.md).

## 각 그룹 작업 사이클

1. 그룹 CSS 를 `globals.css @layer components` 에 토큰 기반 이식 + `components/ui` 타입드 래퍼 작성.
2. `/ui-kit` 쇼케이스에 그룹 섹션 추가.
3. `pnpm typecheck` + `pnpm exec oxlint` + `pnpm build` 검증.
4. **멈춤** → `/ui-kit` 시각 확인 → OK 시 다음 그룹. (커밋은 사용자 요청 시에만)

## 리뷰 후속 메모 (G0~G2 `/review` 결과 중 미반영분)

즉시 반영: BookCard 네이티브 `<button>` 전환(접근성) · Progress 접근 이름 폴백 · 버튼 색 `var(--fg-on-accent)` 토큰화.

후속 정리 대상:

- **status-badge raw hex 토큰화** — wish/paused soft·solid 색(`#3f5e6b`, `#7a5b0f`, `#4f6b7b`, `#1f1a15`)이 디자인 원본에서 이식됐으나 `--talk-*`/`--mark-*` 팔레트에 없는 값. `--talk-600`/`--mark-700` 등 토큰 추가 검토.
- **BookCardView `id` 필드** — 실제 목록 렌더 시 `key`로 쓸 식별자. 도메인 `Book` 연결 시 추가.
- **`bookMetaLine` 단위 테스트** — 순수 함수(상태 5분기 + 엣지)라 Vitest 대상으로 적합.
- **Progress `<i>` → 시맨틱 요소** — `<i>`(이탤릭용) 대신 `<span>`/`<div>` + `aria-hidden`.
- **대문자↔소문자 BookStatus 매핑 위치** — 도메인 도입 시 인프라 Adapter/유스케이스 입력 매핑에서 처리(표현 계층 누수 방지).
- **쇼케이스 인터랙션 데모** — Chip 토글·BookCard onOpen 동작 시연은 별도 Client 컴포넌트로 분리.
- **Select = 커스텀 드롭다운** — 네이티브 `<select>` 의 OS 드롭다운을 못 꾸며서 `.sel`(트리거) + `.sel-menu`(목록) 커스텀 listbox 로 전환(키보드·바깥클릭·포커스 복귀 포함). 폼 연동은 react-hook-form `Controller` 사용(네이티브 ref 직결 아님). 모바일 네이티브 피커는 미사용.
- **SearchInput** — 네이티브 `type=search` 취소 버튼(`::-webkit-search-cancel-button`)을 제거하고 우리 `.clear` 버튼만 사용.
- **BookCard Server/Client 분리(최적화)** — 현재 `onOpen` 없는 정적 카드도 `'use client'`. 정적 목록을 서버에서 다수 렌더할 때 `BookCardDisplay`(server) + 상호작용 래퍼로 분리 검토.
