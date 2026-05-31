# 책담 · Mobile UI Kit (Chaekdam)

iOS-first screens for the Chaekdam reading app, wrapped in the
starter `ios_frame` device chrome. Open `index.html` to interact
with the 5-screen click-thru.

## Screens

1. **Today** — greeting, currently-reading hero card, daily streak grid,
   recent saved quote.
2. **Library** — filter chips + 3-column book cover grid.
3. **Reader** — long-form serif page with user highlights + floating
   toolbar (TOC / brightness / bookmark / AI chat / share).
4. **AI Chat** — book-context conversation with the assistant.
5. **Capture** — camera-style screen for the quote upload flow with
   live OCR preview.
6. **Profile** — reading stats + settings rows.

## Components

- `MobileApp.jsx` — top-level screen switcher + bottom tab bar.
- `HomeScreen.jsx`, `LibraryScreen.jsx`, `ReaderScreen.jsx`,
  `ChatScreen.jsx`, `CaptureScreen.jsx`, `ProfileScreen.jsx`.
- `mobile.css` — local styles, layered on top of `colors_and_type.css`.

## Notes

- All visuals use brand tokens from `../../colors_and_type.css`.
- Book covers are CSS gradients with serif type — placeholders for
  real covers the user will plug in later.
- Bottom tab bar uses translucent `paper-50` with backdrop-blur,
  matching the brand "warm glass" surface.
