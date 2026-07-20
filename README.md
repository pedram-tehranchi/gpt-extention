# GPT Extension

Chrome extension for ChatGPT: cleaned title banner, `//` templates, Auto Allow, and optional conversation-memory pruning.

## Quick start

```bash
npm install
npm run icons   # regenerate 16/48/128 from public/icons/icon-master.png
npm run dev     # watch mode — load dist/ in Chrome
npm run build   # production build
```

### Load in Chrome

1. Run `npm run dev` (or `npm run build` for a one-off build).
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder.

## Features

- **Title banner** — cleaned conversation title on ChatGPT (toggle + prefix in settings)
- **Templates** — type `//` in the composer to insert saved prompts
- **Auto Allow** — auto-click ChatGPT Allow prompts (popup, options, or in-page toggle)
- **Conversation memory** — keep only the latest N DOM turns to lighten long tabs

## Project layout

| Path | Purpose |
|------|---------|
| `public/` | Manifest, icons, fonts |
| `src/background/` | Service worker |
| `src/content/` | ChatGPT content scripts |
| `src/popup/` | Toolbar popup |
| `src/options/` | Settings page |
| `src/services/` | Chrome APIs, storage, messaging |
| `src/components/` | Shadow DOM UI (banner, picker, toggle, toast) |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Helpers |
| `tests/` | Vitest tests |

## Architecture

- **Background** handles messages and storage.
- **Popup / options** are vanilla TypeScript pages (no framework).
- **Content scripts** run on ChatGPT (`chatgpt.com`).
- Communication uses typed messages via `src/services/messaging.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev build with HMR |
| `npm run build` | Type-check + production build |
| `npm run test` | Run tests |
| `npm run icons` | Generate placeholder PNG icons |
