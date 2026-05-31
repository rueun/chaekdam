# Rule: Design System & UI Fidelity

근거: `design-system/DESIGN-SYSTEM.md` · `colors_and_type.css` / `docs/ADR.md` ADR-011 / `docs/PRD.md` 디자인.

## 원칙

- **단일 라이트(페이퍼) 테마. 다크 모드 없음**(ADR-011). 다크용 색·토글을 추가하지 않는다.
- 충실도 **하이파이**: UI 키트(`ui_kits/`)의 레이아웃·색·타이포·여백·카피를 픽셀에 가깝게 재현하되,
  레포의 컴포넌트 시스템으로 구현한다.
- 토큰은 `colors_and_type.css`가 원본. 컴포넌트에 **raw hex 금지** — 의미 토큰(`--bg --surface --fg --accent --divider …`)을 쓴다.

## 색

- 배경: 웜 크림 `--paper-50 #FAF8F2`, 카드 `--paper-100`.
- 텍스트: 웜 니어블랙 `--ink-900 #1A1A18` (**순검정 #000 금지**), 보조 `--ink-600/500`.
- **브랜드/포인트는 딥 포레스트 그린 `--terra-500 #3F6750` 하나뿐.** CTA·브랜드·포커스 링에만.
  (토큰명 `--terra-*`는 back-compat 별칭이며 값은 포레스트 그린. 신규 코드는 `--leaf-*` 권장.)
- 보조색은 **의미별로만**: `--sage-500`(완독/성공), `--clay-500`(완독·오늘 마커), `--talk-500`(AI 귀속), `--mark-100`(하이라이트).
- `--mark-100`(옐로)는 **사용자 강조 텍스트 전용** — 장식 배경으로 쓰지 않는다.

## 타이포

- **Pretendard 전용**(본문·제목·편집체 슬롯 모두). `--font-serif`도 Pretendard 별칭.
- 스케일: display 56 / h1 40 / h2 30 / h3 22 / h4 18 / body 16 / sm 14 / caption 13 / micro 11.
- 한글 자간은 약간 타이트(-0.01~-0.02em), 줄높이는 넉넉히(본문 1.55, 인용 1.7).

## 형태·모션

- radius: sm 8 / md 12 / lg 16 / pill 999. 카드는 그림자 **또는** 살짝 짙은 크림 채움 — 둘 다 쓰지 않는다.
- 그림자 `--shadow-1~4`는 웜 올리브 틴트(차가운 유리 느낌 금지).
- 모션: `--ease-out`, 120/200/320ms, **바운스 없음**. 차분하게.

## 금지

- 다크 모드, 순검정, 두 번째 포인트색 도입, 과한 그라데이션, 이모지(브랜드 요소 아님), SVG로 일러스트 그리기.
- 접근성: 모바일 히트 타깃 ≥ 44px, 본문 대비 충분히.

## 컴포넌트 매핑

- `components/ui/`의 primitive(Button/Card/Chip/Badge/Input/Toggle 등)를 토큰 기반으로 먼저 만들고,
  feature 컴포넌트가 이를 조합한다. 상태 배지(읽는 중/완독/읽고 싶은/쉬는 중) 색은 위 의미색을 따른다.

## 스타일링 구현 방식 (Tailwind 우선 + @theme · 하이브리드)

- **토큰은 Tailwind v4 `@theme`(`app/globals.css`)에 등록**해 유틸로 노출한다.
  예) `bg-surface` `text-ink-900` `text-fg-2` `border-divider` `rounded-md` `shadow-3` `font-serif` `text-h2`.
  - **색·타입 스케일**: 이름이 `:root` 토큰과 다르므로(`--color-bg`↔`--bg`, `--text-h1`↔`--fs-h1`) `@theme inline { --color-bg: var(--bg) }` 로 `:root` 를 참조 → 단일 소스.
  - **radius·shadow·font**: 이름이 Tailwind 네임스페이스와 같아(`--radius-md` 등) inline 참조 시 자기참조가 된다. 이들은 `@theme { --radius-md: 12px }` 처럼 **리터럴로 직접 정의**(non-inline)하고 `:root` 에 중복 정의하지 않는다.
- **기본은 Tailwind 유틸리티.** 컴포넌트 스타일은 유틸로 작성하고, raw hex 대신 위 토큰 유틸(또는 정 필요하면 `[var(--token)]`)을 쓴다.
- **`@layer components` CSS 는 예외적으로만** — 유틸로는 지저분하거나 불가능한 경우에 한정:
  - 의사요소: 배지 점/체크(SVG mask), 체크박스·라디오·토글 커스텀, 밑줄 `::after`, 인용 액센트 바 `::before`
  - 네이티브 입력 재스타일링(`appearance: none`) + data-URI 배경 아이콘(Select 캐럿·Search 아이콘)
  - 이때도 값은 토큰(`var(--*)`)으로. raw hex 는 디자인 원본에서 이식한 경우로 최소화.
- **`@apply` 남용 금지.** 유틸 조합은 className 에서, 공통 패턴은 컴포넌트로 추출.
- 기존 `@layer components` 로 만든 레이아웃/구성 CSS 는 동작하면 유지하되, 손댈 때 유틸로 점진 이전.
