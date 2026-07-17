# PromptVault AI

A modern, local-first web app for saving, organizing, searching and managing your AI prompts — built with plain HTML5, CSS3 and vanilla JavaScript (ES6+). No frameworks, no build step, no backend.

## Features

- **Prompt library** — add, edit, and delete prompts with title, category, tags and body text
- **Instant search** — search across title, prompt text, tags and category as you type
- **Categories** — filter by ChatGPT, Claude, Gemini, Coding, Writing, Business, Productivity, Marketing, Interview
- **Tag cloud** — click any tag (in the toolbar or on a card) to filter
- **Favorites** — star prompts and view them on a dedicated Favorites page
- **Copy to clipboard** — one click, with a "Copied!" confirmation toast
- **Statistics dashboard** — total prompts, favorites, categories, and most-copied prompt, all live
- **Sort** — newest, oldest, A–Z, Z–A, most copied
- **Recently Copied strip** — quick access to your last few copied prompts
- **Random Prompt** — surface a random prompt from your vault in a detail modal
- **Import / Export** — back up or restore your vault as `prompts.json`
- **Dark / light mode** — persisted between visits
- **Keyboard shortcuts** — `Ctrl/Cmd + K` to search, `Ctrl/Cmd + N` to add a prompt, `Esc` to close dialogs
- **20 sample prompts** seeded automatically on first visit so the UI never looks empty
- **Fully responsive** — desktop, tablet and mobile, with a collapsible mobile nav
- **Accessible** — semantic HTML, ARIA labels, visible focus states, skip link, reduced-motion support
- **Persistent** — everything (prompts, theme, recently-copied) is stored in `localStorage`; nothing leaves your browser

## Screenshots

> _Add screenshots here once you've run the app locally:_
> - `assets/images/screenshot-home-dark.png`
> - `assets/images/screenshot-home-light.png`
> - `assets/images/screenshot-modal.png`

## Folder Structure

```
PromptVault/
│
├── index.html          # Markup: nav, hero, stats, grid, modals, toasts
├── style.css            # Design tokens, dark/light themes, responsive layout
├── script.js             # App logic: state, storage, render, events
├── data.js                # Category metadata + 20 seed prompts
├── README.md
│
└── assets/
    ├── icons/
    └── images/
```

## Installation

No build tools or dependencies required.

1. Download or clone this folder.
2. Open `index.html` directly in your browser, **or** serve it locally for the best experience with the Clipboard API:

   ```bash
   # Python 3
   python -m http.server 8080

   # Node (if you have npx available)
   npx serve .
   ```
3. Visit `http://localhost:8080` in your browser.

That's it — your data stays in your browser's LocalStorage from then on.

## Technologies Used

- **HTML5** — semantic markup, `<dialog>`-style modals, forms with native validation hooks
- **CSS3** — custom properties (design tokens), Grid & Flexbox, glassmorphism, `color-mix()`, keyframe animations, responsive media queries
- **Vanilla JavaScript (ES6+)** — modules-in-an-IIFE pattern, `localStorage`, Clipboard API, `FileReader`/`Blob` for import/export, event delegation, `Array.map/filter/reduce/sort`, template literals, debouncing

## Future Improvements

- Drag-and-drop reordering of prompts
- Prompt versioning / history
- Folder or collection grouping beyond categories
- Optional cloud sync (would require a backend)
- Rich text / markdown preview inside prompts
- Bulk actions (multi-select delete/export)
- Shareable public prompt links

## License

MIT — free to use, modify and distribute.
