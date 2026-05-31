# 책담 (Chaekdam) — Design System

> "누구나 3초 만에 이해할 수 있는 사용 경험"
> _Anyone can understand the experience within 3 seconds._

책담 is a reading companion product — an AI-powered space for discussing
books, logging what you read, and saving the lines that mattered. The name
combines **책** (book) and **담(談)** (talk, conversation): literally,
_"book talk."_ It carries a second reading too — **담다** means _"to
hold"_ or _"to contain"_ — so 책담 is both the conversation a reader has
with a book and the quiet vessel that holds those conversations. The
underline mark — the small, deliberate line a reader leaves under a
sentence worth talking about — remains the brand's central visual gesture:
the line that starts a conversation.

This design system is the source of truth for visual, content, and
component decisions across both the web and native app surfaces.

---

## Product context

**Operator.** 프리랜서 디자이너 홍길동 (Hong Gil-dong) — a 3-year
UI/UX freelancer designing apps and sites that are pleasant to look at
and easy to use.

**The product line.** A reading service shipped as both a responsive web
app and a mobile app. Core features:

- **AI 독서토론** — AI-led book discussion. The reader and an AI
  partner exchange ideas about a finished or in-progress book.
- **독서 기록** — reading log. Track books, sessions, finished pages,
  reflections.
- **문구 업로드** — meaningful-quote capture. Snap a photo of a page,
  the line is extracted and saved, taggable, shareable.

**Audience.** Wide — the user explicitly asked for a point color
"that does not feel off-putting to any age or gender." We optimized
for that brief: a deep forest green against warm cream paper, calm
and age-/gender-neutral, easily readable for older eyes and friendly
enough for younger readers.

**Sources.**

- No external codebase or Figma was provided.
- Brand brief: see the project intro message ("우리 브랜드의 목표는…").
- Provided fonts: Pretendard (9 weights, OTF) — see `fonts/`.
- All other assets in this system (logo, palette, components, UI kit)
  were created from scratch for this brief.

---

## Brand promise — "3초 안에 이해되는 경험"

Every screen should pass the **3-second test**: a brand-new user
should know what the screen does and what to do next within three
seconds of arriving. Practical consequences:

1. One primary action per screen, always forest green.
2. Headings tell you _what_, sub-copy tells you _why_, in that order.
3. Visual hierarchy: one big thing, one medium thing, lots of small things.
4. Never two competing accents on the same surface.

---

## CONTENT FUNDAMENTALS

책담's voice is the voice of a thoughtful friend who reads a lot. Quiet,
warm, never lecturing.

### Voice & tone

- **Quiet warmth.** Speak like you're handing someone a book you loved —
  no shouting, no marketing slogans, no exclamation marks unless
  genuinely celebratory (e.g. "100권 달성!").
- **Reader-first.** The reader is the protagonist. The product is the
  bookshelf, not the librarian.
- **Concrete over abstract.** "이번 주에 23페이지를 읽었어요" beats
  "독서 활동이 활발해요."

### Address & politeness

- **2nd person, polite (해요체)** for product copy: "오늘 읽은 부분을
  저장해 보세요", "다시 만나서 반가워요."
- **1st person, polite (저)** when the product speaks about itself:
  "제가 추천드린 책이에요." Reserve for the AI discussion partner.
- Never use 반말. Never use formal 합쇼체 except in legal screens.

### Casing & punctuation

- **Korean primary.** English titles stay in Title Case ("AI Discussion"),
  not all caps.
- **No emoji** in product UI. Emoji feel loud and dated against the
  paper aesthetic. Exception: the **underline mark** glyph "ㅡ" /
  the brand's own line motif may be used decoratively.
- **Periods are optional** at the end of single-sentence UI strings.
  Periods are required in body paragraphs.
- Numbers use thousands separators in Korean style (1,200권).

### Length & rhythm

- Headings ≤ 18 Korean characters. Wrap if needed.
- Body lines ≤ 60 Korean characters. Korean wraps awkwardly past that.
- Buttons: 2–6 characters preferred ("저장", "기록하기", "토론 시작").

### Example copy

| Context      | Yes                                                           | No                                    |
| ------------ | ------------------------------------------------------------- | ------------------------------------- |
| Empty state  | 아직 밑줄 그은 문장이 없어요. 마음에 닿은 한 줄을 담아두세요. | 데이터가 없습니다. 항목을 추가하세요. |
| Save confirm | 한 줄 저장됨                                                  | Save successful!                      |
| AI invite    | 이 책에 대해 같이 이야기해 볼까요?                            | AI와 채팅을 시작하세요.               |
| Stats        | 이번 주, 4일 읽었어요                                         | 주간 활동: 4/7일                      |
| Error        | 사진을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.         | 오류가 발생했습니다.                  |

---

## VISUAL FOUNDATIONS

### The metaphor

The product is a paper book that listens. Surfaces look like aged
cream paper. Type behaves like ink. The accent color appears as an
**actual underline** beneath words that matter — never as a button
fill on flat surfaces.

### Color

- **Backgrounds are warm cream**, never pure white. Pure white feels
  clinical against ink-colored text and breaks the paper feeling.
- **Text is warm near-black** (`--ink-900` / `#1F1A15`), not `#000`.
- **One brand accent**: deep forest green `#2D4A3A` (`--terra-500`).
  The name `--terra-*` is a back-compat token; the values represent the
  forest family. It does the work of CTAs, focus rings, brand marks,
  and the underline glyph. Never tinted into a gradient. Never paired
  with a second hue of
  equal weight on the same surface.
- **Sage green** is a quiet secondary used only for "saved /
  recorded / completed" states. Never for primary CTAs.
- **Highlighter yellow** is used to mark quoted passages — i.e. as the
  in-text highlight color, mirroring a real reader's behaviour.
- **AI/discussion accent** is a desaturated warm blue, used only on
  AI-attributed bubbles and badges. Sparing.

See `colors_and_type.css` for the full token list.

### Type

- **Pretendard** is the UI/body face — Korean-first, sans-serif,
  9 weights available.
- **Noto Serif KR** is the literary display face used for **quotes,
  book titles, and large editorial numerals**. (Substitution note:
  no serif file was supplied — we loaded Noto Serif KR from Google
  Fonts. If you have a preferred serif, drop it into `fonts/` and
  swap the `--font-serif` token.)
- Headings: Pretendard Bold/SemiBold with tight letter-spacing
  (`-0.02em`). Korean glyphs are wide; tightening keeps headings
  feeling intentional.
- Body: Regular 16px, line-height 1.55. For long-form reading
  (book detail, AI transcripts) we shift to 17px / 1.75.

### Spacing & layout

- 4px base spacing scale (`--sp-1` through `--sp-24`).
- Page gutter: 20px on mobile, 32px on tablet, 64px on desktop.
- Max content width: **720px** for reading surfaces (quotes, AI
  transcripts), **1200px** for index/library views.
- Generous vertical rhythm. We default to `--sp-8` between sections,
  not `--sp-4`. The page should never feel crowded.

### Backgrounds

- **No photographic hero backgrounds.** Imagery lives inside cards,
  framed by paper.
- **No gradients** as backgrounds — gradients feel digital and
  break the paper metaphor. (Exception: the very subtle paper
  texture overlay, which is allowed but optional.)
- Imagery vibe: when photographs of books / quotes appear they
  should be **warm, slightly desaturated, never cool-toned**. Crops
  favor partial pages, edges of book spines, paper texture.

### Borders & dividers

- 1px solid `--divider` on cream surfaces.
- Cards usually do **not** have borders — they use shadow OR a
  slightly darker cream fill, not both.

### Corners

- 12px (`--radius-md`) is the default card/button radius.
- 8px for inputs and small chips.
- 24px (`--radius-xl`) for large hero cards and modals.
- Pill (`--radius-pill`) only for filter chips and tags.

### Shadows

- Shadows are **warm** (forest-tinted near-black) and **soft**
  (large blur, low opacity). Four-step scale; most surfaces use
  shadow-1 or shadow-2.
- Pressed states use the inset shadow `--shadow-inset`.

### Motion

- **Slow, no bounces.** All easing is `cubic-bezier(0.22, 0.61, 0.36, 1)`
  ("ease-out") or a symmetric ease-in-out for two-way transitions.
- Durations: 120 / 200 / 320 / 480ms. Default is 200ms.
- Transition properties: opacity, transform, color, background.
  Never animate `width`/`height` — use `transform: scale` instead.

### Interaction states

| State          | Treatment                                                      |
| -------------- | -------------------------------------------------------------- |
| Hover (button) | Background shifts one step darker (terra-500 → terra-600).     |
| Hover (card)   | Shadow steps up one level, no scale change.                    |
| Press (button) | Inset shadow + 1px translate-y, no color change.               |
| Press (card)   | `transform: scale(0.99)`, 120ms.                               |
| Focus          | 3px outer ring of `--accent-ring`, 2px offset. Always visible. |
| Disabled       | 40% opacity, `cursor: not-allowed`, no hover transitions.      |
| Selected       | Sage fill + sage left-mark (the "saved" gesture).              |

### Transparency & blur

- Used only for **app-bar protection gradients** when content
  scrolls under the top bar, and for **modal scrims** (12% ink,
  0px blur — we don't use frosted glass; it competes with the
  paper feeling).

### Cards

- Default: cream fill (`--paper-100`), no border, `--shadow-1`,
  `--radius-md`, `--sp-5` internal padding.
- Quote card: serif type, optional left-side forest-green line
  (3px solid, not a full border).
- Book card: 2:3 cover aspect ratio, cream pedestal.

### Layout rules

- Top bar is sticky on mobile, static on desktop.
- Bottom tab bar on mobile only (5 tabs max).
- Floating action button (FAB) is reserved for the **quote-capture
  shutter** on the mobile app — forest-green circle, bottom-center,
  above the tab bar.

---

## ICONOGRAPHY

Iconography uses **Lucide** at a consistent **1.75px stroke** weight
and 24px (or 20px) size. Lucide's slightly rounded line caps pair
naturally with Pretendard.

**Substitution flag.** No icon set was supplied with the brief. We
chose Lucide because it (a) is CDN-available, (b) has a comprehensive
Korean-relevant glyph set (book, bookmark, pen, etc.), and (c) its
stroke style matches the warm/clean paper aesthetic. If you want a
custom set, replace `assets/icons/` and update the README.

- **Source.** Lucide via CDN: `https://unpkg.com/lucide@latest`.
  No icon font is installed; SVGs are inlined or loaded by the
  Lucide JS adapter.
- **Stroke weight.** 1.75 (Lucide's default is 2; we go slightly
  lighter for a more refined feel).
- **Color.** Inherits `currentColor`. Default is `--fg-2`. Active /
  selected icons use `--accent`.
- **Sizing.** 24px in app bars, navigation, and primary actions.
  20px inline with body text. 16px in tags/chips.
- **No emoji** in product UI. **No unicode dingbats** as icons —
  always a real Lucide glyph.
- **No hand-rolled SVGs in component code.** If we need a glyph
  Lucide doesn't have, draw it once, save to `assets/icons/`,
  and reference it.

The brand mark (the "underline" glyph) is the only piece of
custom vector work — see `assets/logo/`.

---

## Index — what's in this folder

```
README.md                ← you are here
SKILL.md                 ← Agent-Skill manifest (cross-compatible)
colors_and_type.css      ← all CSS tokens & semantic type classes
fonts/                   ← Pretendard OTF (9 weights)
assets/
  logo/                  ← brand mark variants (SVG)
  icons/                 ← Lucide icon usage notes (CDN-loaded)
  imagery/               ← placeholder paper textures, sample covers
preview/                 ← Design System tab cards (~700×… each)
ui_kits/
  web/                   ← responsive web UI kit (index.html + JSX)
  mobile/                ← native-style mobile UI kit (index.html + JSX)
```

### Quick links

- **Tokens** → `colors_and_type.css`
- **Web UI** → `ui_kits/web/index.html`
- **Mobile UI** → `ui_kits/mobile/index.html`
- **Voice & tone** → see "CONTENT FUNDAMENTALS" above
- **Component states** → "VISUAL FOUNDATIONS → Interaction states"

---

## Caveats / open questions

- Brand **name** ("책담") was invented for this brief. Swap freely if
  the operator has chosen a different name.
- **Serif** is a Google Fonts fallback (Noto Serif KR). If a specific
  literary serif is preferred, drop it into `fonts/`.
- **Icon set** is Lucide (CDN). If brand-owned icons exist, replace.
- **Imagery** uses public-domain paper textures and book-cover
  placeholders. Real product photography should replace these.
