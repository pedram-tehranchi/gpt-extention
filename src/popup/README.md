# src/popup

## Purpose

Toolbar popup UI for quick status and common settings.

## Contains

- `index.html`: Popup markup
- `main.ts`: Loads settings/templates, toggles Auto Allow and prune options, opens options page
- `popup.css`: Popup styles (design-system tokens)

## Rules

- Vanilla TypeScript only — no framework.
- Use `src/services/*` for storage and messaging; do not call raw `chrome.*` APIs here.
- Keep the popup focused on frequent toggles; full template CRUD stays in options.

## Connections

- Talks to the service worker via `src/services/messaging.ts` (e.g. `PING`).
- Reads/writes settings and templates through `src/services/settings.ts` and `src/services/templates.ts`.
- Declared as `action.default_popup` in `public/manifest.json`.

## Update rule

Update this file when popup controls, scripts, or connections change.
