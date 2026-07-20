# src/styles

## Purpose

Shared CSS and font-loading helpers for extension pages and in-page Shadow DOM UI.

## Contains

- `global.css`: Design tokens and base styles for popup/options
- `content.css`: Styles injected into Shadow DOM components on ChatGPT
- `extensionFonts.ts`: Builds `@font-face` CSS from `chrome.runtime.getURL('fonts/…')`

## Rules

- Follow `design-system/MASTER.md` for tokens and visual rules.
- Content UI must use `withExtensionFonts` (or equivalent) so fonts load on chatgpt.com.
- Do not rely on host-page fonts or CSS for Shadow DOM components.

## Connections

- Popup/options import `global.css`.
- Components under `src/components/` use `content.css` + `extensionFonts.ts`.
- Font files live in `public/fonts/` and are web-accessible per the manifest.

## Update rule

Update this file when CSS entry points, tokens, or font loading change.
