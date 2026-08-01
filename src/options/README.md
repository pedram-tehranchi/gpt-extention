# src/options

## Purpose

Full settings page: title banner, Auto Allow, conversation prune, template CRUD/reorder, and pinned URL CRUD/reorder.

## Contains

- `index.html`: Options page markup (collapsible sections, closed by default)
- `main.ts`: Auto-saving preferences; template/pin CRUD and reorder
- `options.css`: Options styles (design-system tokens)

## Rules

- Vanilla TypeScript only — no framework.
- Use `src/services/*` for persistence; do not call raw `chrome.*` APIs here.
- Opened in a tab (`options_ui.open_in_tab`).

## Connections

- Uses `src/services/settings.ts`, `src/services/templates.ts`, and `src/services/pins.ts`.
- Declared as `options_ui.page` in `public/manifest.json`.
- Linked from the popup via “Open options”.

## Update rule

Update this file when options UI, settings fields, template management, or pinned URLs change.
