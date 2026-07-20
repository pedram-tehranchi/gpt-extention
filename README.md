# GPT Extension

Chrome extension for ChatGPT: cleaned title banner, `//` templates, Auto Allow, and optional conversation-memory pruning.

## Quick start

```bash
npm install
npm run icons   # regenerate 16/48/128 from public/icons/icon-master.png
npm run dev     # watch mode — load dist/ in Chrome
npm run build   # type-check, production build, verify dist
npm run test    # Vitest
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

## Design system

See [`design-system/MASTER.md`](design-system/MASTER.md) for colors, type, shape, and UX rules. Follow it for all UI changes.

For agent work that changes UI/UX, use the project skill [`.cursor/skills/gpt-extension-ui-ux/SKILL.md`](.cursor/skills/gpt-extension-ui-ux/SKILL.md).

## Project layout

| Path | Purpose |
|------|---------|
| `public/` | Manifest, icons, fonts |
| `design-system/` | UI/UX source of truth (`MASTER.md`) |
| `scripts/` | Icon generation and post-build verification |
| `src/background/` | Service worker |
| `src/content/` | ChatGPT content scripts |
| `src/popup/` | Toolbar popup |
| `src/options/` | Settings page |
| `src/services/` | Chrome APIs, storage, messaging |
| `src/components/` | Shadow DOM UI (banner, picker, toggle, toast) |
| `src/styles/` | Shared CSS and extension font helpers |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Helpers |
| `tests/` | Vitest tests |

## Architecture

- **Background** handles messages and storage.
- **Popup / options** are vanilla TypeScript pages (no framework).
- **Content scripts** run on ChatGPT (`chatgpt.com`) and use `src/content/chromeApi.ts` instead of `src/services/*` (avoids MV3 web-accessible SW chunk issues).
- Communication uses typed messages via `src/services/messaging.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev build with HMR |
| `npm run build` | Type-check + production build + `scripts/verify-extension-build.mjs` |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run icons` | Regenerate 16/48/128 PNGs from `icon-master.png` |
| `npm run preview` | Preview the Vite build |
