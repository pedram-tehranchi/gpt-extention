# GPT Extension

Chrome extension scaffold built with Manifest V3 and TypeScript.

## Quick start

```bash
npm install
npm run icons   # placeholder icons (replace with real ones later)
npm run dev     # watch mode — load dist/ in Chrome
npm run build   # production build
```

### Load in Chrome

1. Run `npm run dev` (or `npm run build` for a one-off build).
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder.

## Project layout

| Path | Purpose |
|------|---------|
| `public/` | Manifest and static assets |
| `src/background/` | Service worker |
| `src/content/` | Page-injected scripts (not wired in manifest yet) |
| `src/popup/` | Toolbar popup UI |
| `src/options/` | Settings page |
| `src/services/` | Chrome APIs, storage, messaging |
| `src/components/` | Shared UI (empty — add as needed) |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Helpers |
| `tests/` | Vitest tests |

## Architecture

- **Background** handles messages and storage.
- **Popup / options** are vanilla TypeScript pages (no framework).
- **Content scripts** are ready but not registered — add a `content_scripts` block to `public/manifest.json` when needed.
- Communication uses typed messages via `src/services/messaging.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev build with HMR |
| `npm run build` | Type-check + production build |
| `npm run test` | Run tests |
| `npm run icons` | Generate placeholder PNG icons |
