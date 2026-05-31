# 책담 — Web UI Kit

Responsive web surfaces for the reading service. Built with the foundations
in `/colors_and_type.css`. Pretendard for UI, Noto Serif KR for literary
display. Lucide icons.

## Files

- `index.html` — entry point. Tab-switches between 4 screens.
- `web.css` — layout & component styles (imports `colors_and_type.css`).
- `components.jsx` — React components.

## Screens

- **홈 (Home)** — daily hero, books in progress, recent underlines, streak.
- **내 서재 (Library)** — grid of all books with filter chips.
- **읽는 중 (Reader)** — long-form reader pane next to AI discussion panel.
- **밑줄 모음 (Quotes)** — feed of saved quotes.

## Components in this kit

`Sidebar` · `TopBar` · `Hero` · `BookCard` · `QuoteCard` · `StreakCard` ·
`RecCard` · `ReaderPane` · `ChatPanel` and the four `Page*` shells.

## Responsiveness

Designed at 1280px reference width. The grid layout collapses to a single
column under 960px; the sidebar should be hidden behind a hamburger at
mobile widths (not implemented in this kit — see the mobile kit instead).
